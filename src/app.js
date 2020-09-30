//test file https://raw.githubusercontent.com/EnricoPietrocola/Cid/master/Instructions.pdf

const path = require('path')
const hbs = require('hbs')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const http = require('http')
const https = require('https')
const app = express()
const socketio = require('socket.io')
const multer = require('multer')
const rooms = require('../src/rooms.js')

const httpsArgs = process.argv.slice(2)
console.log('httpsArgs: ', httpsArgs)

const key = httpsArgs[0]
const cert = httpsArgs[1]
const ca = httpsArgs[2]
let domain = httpsArgs[3]

if (domain === undefined || domain === null){
  domain = 'https://127.0.0.1'
}

console.log(key + " " + cert)

app.use(cors())

//app.use(express.static(__dirname + '/public')) //this might be removed, check later

const PORT = process.env.PORT || 80

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
const uploadsDirectoryPath = path.join(__dirname, '../uploads')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
  res.render('index', {
    title: 'CidReader',
    name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
  })
})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage: storage,

  fileFilter: function (req, file, cb) {

    const filetypes = /pdf|PDF/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File upload only supports the following filetypes - " + filetypes);
  }
})

app.post('/pdfupload', upload.single('docUpload'), function (req, res, next) {
  //get new uploaded file, move it in proper room folder path
  const originalName = req.file.originalname
  const documentUrl = domain + '/uploads/' + req.file.originalname
  const roomNameReq = req.query.roomname
  console.log('POST ROOM IS ' + roomNameReq)

  fs.copyFile(uploadsDirectoryPath + '/' + originalName , uploadsDirectoryPath + '/' + roomNameReq + '/' + originalName, (err) => {
    if (err) throw err;
    console.log('moved doc to room folder, deleting doc from temp folder')
    fs.unlinkSync(uploadsDirectoryPath + '/' + originalName)

  });

  rooms.changeRoomDocURL(roomNameReq, documentUrl) //this line is repeated in case a file stayed on the server after a reboot

  res.send(documentUrl)
})

let totalConnections = 0

app.get('/status', (req, res) => {
  res.send('Cid is running, with ' + rooms.rooms.length + ' open rooms, with ' + rooms.getConnectionsCount() + ' total users. Total connections since last reboot are ' + totalConnections )
})


app.get('/get-documentttt', (req, res) => {
  const documentUrl = req.query.url
  const roomNameReq = req.query.roomname

  console.log('Fetch request from ' + roomNameReq + ' url ' + documentUrl)

  const fileName = documentUrl.substring(documentUrl.lastIndexOf('/')+1);

  const filePath = uploadsDirectoryPath + '/' + roomNameReq + '/' + fileName
  console.log('FETCH FILE PATH ' +  filePath)


  if(fs.existsSync(filePath)) {
    console.log("The file exists.");
    res.sendFile(filePath)
    rooms.changeRoomDocURL(roomNameReq, filePath) //this line is repeated in case a file stayed on the server after a reboot
  } else {
    console.log('New file request, adding to library')
    const file = fs.createWriteStream(filePath)
    https.get(documentUrl, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log('pdf path ' + filePath)
        rooms.changeRoomDocURL(filePath)
        res.sendFile(filePath)
      })
    })

  }


})

//app.get('/uploads', (req, res) => {
  //res.send('Access Denied - Please create a room with a different name')
//})

app.get('*', (req, res) => {
  res.render('room', {
    title: 'CidReader',
    name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
  })
})

let httpsServer;
let httpServer
let io;

try {
  if (fs.existsSync(key) && fs.existsSync(cert)) {
    //file exists
    httpsServer = https.createServer({
      key: fs.readFileSync(key, 'utf8'),
      cert: fs.readFileSync(cert, 'utf8'),
      ca: fs.readFileSync(ca, 'utf8')
    }, app).listen(443)
    io = socketio(httpsServer)
    console.log('Https server running')
  }
  else {
    console.log('Something went wrong with SSL certificates, starting http server')
    httpServer = http.createServer(app);
    io = socketio(httpServer)
    httpServer.listen(PORT)
  }
} catch(err) {
    console.error(err)
}

/*app.listen(PORT, () => {
  console.log("Server starting on port : " + PORT)
})*/

///////////////////////////////////////////////////////////////////////////////////////////
//Real-time section

io.on('connection', (socket) => {
  console.log("new websocket connection")

  socket.on('join', (roomName)=> {
    socket.join(roomName)
    totalConnections++
    const dir = uploadsDirectoryPath + '/' + roomName

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    const room = rooms.addRoom(roomName, '')
    rooms.setRoomPath(roomName, dir)

    console.log('Current rooms are ' + rooms.rooms.length)

    if(rooms.getRoomURL(roomName) !== ''){
      io.to(socket.id).emit('signalchannel','changeDocument,' + rooms.getRoomURL(roomName))
      console.log('Sending room url to client ' + rooms.getRoomURL(roomName))
    }
    else{
      console.log('Room Url not set')
    }
    //io.to(socket.id).emit('datachannel', docURL) //this can be used to send pdf data to client

    socket.to(roomName).broadcast.emit('datachannel', 'A new user joined the room')
  })

  socket.on('datachannel', (room, data) =>{
    socket.to(room).broadcast.emit('datachannel', data)

    //data = JSON.parse(data.toString())
    //console.log(data)
  })

  socket.on('signalchannel', (room, data)=>{
    console.log('received socket change url request in room ' + room + ' url doc ' + data)
    io.to(room).emit('signalchannel', 'changeDocument,' + data)
  })

  socket.on('disconnecting', () => {
    const ioRooms = Object.keys(socket.rooms);
    const room = rooms.findRoomByName(ioRooms[1])
    rooms.decrementRoomConnection(room)
  });


  socket.on('disconnect', () => {
    io.emit('message','A user has left')
  })
})

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
