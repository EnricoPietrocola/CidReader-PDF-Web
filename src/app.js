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

const httpsArgs = process.argv.slice(2)
console.log('httpsArgs: ', httpsArgs)

const key = httpsArgs[0]
const cert = httpsArgs[1]
const ca = httpsArgs[2]

console.log(key + " " + cert)

app.use(cors())

app.use(express.static(__dirname + '/public'))

const PORT = process.env.PORT || 80

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

/*app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})*/

app.get('', (req, res) => {
  res.render('index', {
    title: 'CidReader',
    name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
  })
})

app.get('/get-document', (req, res) => {
  const documentUrl = req.query.url

  const fileName = Date.now() + '.pdf'
  const filePath = publicDirectoryPath + "/" + fileName
  console.log(filePath)
  const file = fs.createWriteStream(filePath)

  // could this https part be replaced by the response package to support http and https?
  https.get(documentUrl, (response) => {
    response.pipe(file)

    file.on('finish', () => {
      file.close()
      res.json({fileName})
      setTimeout(function() {
        try {
          fs.unlinkSync(filePath)
          //file removed
        } catch (err) {
          console.error(err)
        }
      }, 60000);

    })
  })
})

app.get('*', (req, res) => {
  res.render('room', {
    title: 'CidReader',
    name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
  })
})

let httpsServer;

try {
  if (fs.existsSync(key) && fs.existsSync(cert)) {
    //file exists
    httpsServer = https.createServer({
      key: fs.readFileSync(key, 'utf8'),
      cert: fs.readFileSync(cert, 'utf8'),
      ca: fs.readFileSync(ca, 'utf8')
    }, app).listen(443)

    //httpsServer.listen(8443)
    console.log('Https server running')

    //const io = socketio(httpsServer)

  }
  else {
    console.log('Something went wrong with SSL certificates')
  }
} catch(err) {
  console.error(err)
}

/*app.listen(PORT, () => {
  console.log("Server starting on port : " + PORT)
})*/

//const httpServer = http.createServer(app);
//const io = socketio(httpServer)

const io = socketio(httpsServer)
//httpServer.listen(PORT)
//console.log('Http server running')

io.on('connection', (socket) => {
  console.log("new websocket connection")

  //socket.emit('message', 'hey')
  //socket.broadcast.emit('message', 'New user connected')

  /*socket.on('message', (data, callback) =>{
    console.log("heyEvent")
    io.to('room').emit('asd', data)
    callback('test')
  })*/
  socket.on('join', (room)=> {
    socket.join(room)
    socket.to(room).broadcast.emit('datachannel', 'A new user joined the room')
  })

  socket.on('datachannel', (room, data) =>{
    socket.to(room).broadcast.emit('datachannel', data)

    data = JSON.parse(data.toString())
    console.log(data)
  })

  /*socket.on('disconnect', () => {
    io.emit('message','A user has left')
  })*/
})

// https://socket.io/docs/rooms/