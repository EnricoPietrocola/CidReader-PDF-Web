const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const app = express();

app.use(cors());
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/get-document', (req, res) => {
  const documentUrl = req.query.url;

  const fileName = Date.now() + '.pdf';
  const file = fs.createWriteStream(__dirname + '/public/' + fileName);

  https.get(documentUrl, (response) => {
    response.pipe(file);

    file.on('finish', () => {
      file.close();
      res.json({ fileName })
    });

  });
});

app.listen(PORT, () => {
  console.log("Server starting on port : " + PORT)
});
