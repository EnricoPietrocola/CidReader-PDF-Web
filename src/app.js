//test file https://raw.githubusercontent.com/EnricoPietrocola/Cid/master/Instructions.pdf

const path = require('path')
const hbs = require('hbs')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const https = require('https')
const app = express()

app.use(cors())

app.use(express.static(__dirname + '/public'))

const PORT = process.env.PORT || 5000

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
      res.json({ fileName })
    })

  })
})

app.get('*', (req, res) => {
  res.render('room', {
    title: 'CidReader',
    name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
  })
})

app.listen(PORT, () => {
  console.log("Server starting on port : " + PORT)
})

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runSignalhub() {
  const { stdout, stderr } = await exec('signalhub listen -p 8080');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}
runSignalhub();
