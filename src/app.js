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

app.get('', (req, res) => {
  res.render('index', {
    title: 'CidReader',
    name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
  })
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

app.post('/pdfupload', upload.single('docUpload'), function (req, res, next) {
  //req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  const documentUrl = 'www.cidreader.com' + '/uploads/' + req.file.originalname
  console.log('Post ' + documentUrl)
  //et file = fs.createReadStream(publicDirectoryPath + '/uploads/' + req.file.originalname)

  res.send(documentUrl)
})

app.get('/get-document', (req, res) => {
  const documentUrl = req.query.url

  const fileName = Date.now() + '.pdf'

  const filePath = publicDirectoryPath + '/uploads/' + fileName
  console.log(filePath)
  const file = fs.createWriteStream(filePath)

  https.get(documentUrl, (response) => {
    response.pipe(file)

    file.on('finish', () => {
      file.close()
      //res.json({fileName})
      console.log('Sending ' + fileName)
      const url = 'www.cidreader.com' + '/uploads/' + fileName
      res.json({url})
      /*setTimeout(function() {
        try {
          fs.unlinkSync(filePath)
          //file removed
        } catch (err) {
          console.error(err)
        }
      }, 60000);
    */
    })
  })
})

app.get('/uploads', (req, res) => {

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

    console.log('Https server running')
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
//httpServer.listen(PORT)

///////////////////////////////////////////////////////////////////////////////////////////
//Real-time section

const io = socketio(httpsServer)

io.on('connection', (socket) => {
  console.log("new websocket connection")

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