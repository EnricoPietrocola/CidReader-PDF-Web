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

  if (domain === undefined || domain === null) {
    domain = 'https://127.0.0.1'
  }

  console.log(key + " " + cert)

  app.use(cors())

  app.use(express.static(__dirname + '/public')) //this might be removed, check later

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

  const pdfjsPath = path.join(publicDirectoryPath, '/pdfjs/')
  app.use(express.static(pdfjsPath))

  app.get('', (req, res) => {
    res.render('index', {
      title: 'CidReader (Beta)',
      name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
    })
  })

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, '../uploads/')
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    }
  })

  const upload = multer({
    storage: storage,
    limits: { fileSize: 10485760 },
    fileFilter: function(req, file, cb) {

      const filetypes = /pdf|PDF/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb("Error: File upload only supports the following filetypes - " + filetypes);
    }
  })

  app.post('/pdfupload', upload.single('docUpload'), function(req, res, next) {
    //get new uploaded file, move it in proper room folder path
    const originalName = req.file.originalname
    const documentUrl = domain + '/uploads/' + req.file.originalname
    const roomNameReq = req.query.roomname
    const socketID = req.query.socket
    //console.log('POST ROOM IS ' + req.query.roomname)

    console.log('Request sent by user socketID ' + socketID)
    try {
      fs.copyFile(uploadsDirectoryPath + '/' + originalName, uploadsDirectoryPath + '/' + roomNameReq + '/' + originalName.replace(/#/g,"_").replace(/ /g,"_"), (err) => {
        try{
          if (err) throw err;

        console.log('moved doc to room folder, deleting doc from temp folder')
        fs.unlinkSync(uploadsDirectoryPath + '/' + originalName)

        rooms.changeRoomDocURL(roomNameReq, documentUrl) //this line is repeated in case a file stayed on the server after a reboot

        //io.to(roomNameReq).emit('signalchannel', 'changeDocument,' + documentUrl)
        io.to(socketID).emit('datachannel', 'notifyDocLink,' + documentUrl)
        res.send(" ");
        }
        catch(e){
          console.log(e)
        }
      });
    }
    catch (e){
      console.log(e)
    }
  })

  let totalConnections = 0

  app.get('/status', (req, res) => {
    res.send('Cid is running, with ' + rooms.rooms.length + ' open rooms, with ' + rooms.getConnectionsCount() + ' total users. Total connections since last reboot are ' + totalConnections)
  })

  app.get('/public/docs', (req, res) => {
  })
  app.get('/docs', (req, res) => {
  })

  app.get('/get-document', (req, res) => {
    const documentUrl = req.query.url
    const roomNameReq = req.query.roomname
    console.log(req.query)

    //console.log('Fetch request from ' + roomNameReq + ' url ' + documentUrl)
    console.log('req room ' + roomNameReq)
    const fileName = documentUrl.substring(documentUrl.lastIndexOf('/') + 1);
    const filePath = uploadsDirectoryPath + '/' + roomNameReq + '/' + fileName
    console.log('FETCH FILE PATH ' + filePath)
    try {
      if (fs.existsSync(filePath)) {
        console.log("The file exists. Sending file to client");
        res.sendFile(filePath)
      } else {

      }
    }
    catch(e){
      console.log(e)
    }
  })

app.get('/uploads', (req, res) => {
    res.send('Access Denied - Please create a room with a different name')
})

  app.get('/reader', (req, res) => {
    //res.sendFile("D:/RepoCidReaderWeb/public/pdfjs/web/viewer.html")
    res.send('Access Denied - Please create a room with a different name')
  })

  app.get('/player', (req, res) => {
    res.sendFile(path.join(publicDirectoryPath, '/player.html'))
  })

  app.get('/termsandconditions', (req, res) => {
    res.sendFile(path.join(publicDirectoryPath, '/docs/TermsandConditionsofUseCidReader.pdf'))
  })

  app.get('/about', (req, res) => {
    res.render('about', {
      title: 'CidReader (Beta)',
      name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
    })
  })

  app.get('/help', (req, res) => {
    res.sendFile(path.join(publicDirectoryPath, '/docs/welcometocidreader.pdf'))
  })

  app.get('/faq', (req, res) => {
    res.render('faq', {
      title: 'CidReader (Beta)',
      name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
    })
  })

  app.get('/contacts', (req, res) => {
    res.render('contacts', {
      title: 'CidReader (Beta)',
      name: 'Enrico Pietrocola thanks to GARR and Conservatorio G.Verdi Milano'
    })
  })

  app.get('/contact', (req, res) => {
    //res.sendFile(path.join(publicDirectoryPath, '/player.html'))
    res.send('Work in progress')
  })

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDirectoryPath, './pdfjs/build/generic/web/viewer.html'))
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
        //ca: fs.readFileSync(ca, 'utf8') //hide this if your ssl keys don't include ca
      }, app).listen(443)
      io = socketio(httpsServer)
      console.log('Https server running')
    } else {
      console.log('Something went wrong with SSL certificates, starting http server')
      httpServer = http.createServer(app);
      io = socketio(httpServer)
      httpServer.listen(PORT)
    }
  } catch (err) {
    console.error(err)
  }

  /*app.listen(PORT, () => {
    console.log("Server starting on port : " + PORT)
  })*/

///////////////////////////////////////////////////////////////////////////////////////////
//Real-time section

  io.on('connection', (socket) => {
    console.log("new websocket connection")

    socket.on('join', (roomName) => {
      socket.join(roomName)
      totalConnections++
      const dir = uploadsDirectoryPath + '/' + roomName
      console.log(roomName)

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      rooms.addRoom(roomName, '')
      rooms.setRoomPath(roomName, dir)

      if (rooms.getRoomURL(roomName) !== '') {

        //document should be checked for integrity before sending this messages
        io.to(socket.id).emit('datachannel', 'changeDocument,' + rooms.getRoomURL(roomName))
        io.to(socket.id).emit('datachannel', 'changePage,' + rooms.findRoomByName(roomName).currentPage)

        console.log('Sending room url to client ' + rooms.getRoomURL(roomName) + ' on page ' + rooms.findRoomByName(roomName).currentPage)
      } else {
        //io.to(socket.id).emit('signalchannel', 'visualizePublic,' + domain + '/docs/welcomeToCidReader.pdf')
        console.log('Room Url not set')
      }
      //io.to(socket.id).emit('datachannel', docURL) //this can be used to send pdf data to client

      socket.to(roomName).broadcast.emit('datachannel', 'A new user joined the room')
    })

    socket.on('datachannel', (room, data) => {
      socket.to(room).broadcast.emit('datachannel', data)
      if (data !== undefined && data !== null) {

        if (isJson(data)) {
          data = JSON.parse(data.toString())
        } else {
          //console.log('sendData received non JSON data: ' + data)
        }

        //console.log(data)

        const cmd = data.split(",");

        switch (cmd[0]) {
          case "changePage":
            rooms.setCurrentPageNumber(room, parseInt(cmd[1]))
            break;

          default:
          //console.log('RECV msg ' + data)
        }
      }
    })

    /*socket.on('signalchannel', (room, data) => {
      if (isJson(data)) {
        data = JSON.parse(data.toString())
      } else {
        //console.log('sendData received non JSON data: ' + data)
      }

      console.log('received socket change url request in room ' + room + ' url doc ' + data)
      io.to(room).emit('signalchannel', 'changeDocument,' + data)
      io.to(room).emit('datachannel', 'changePage,1')
      rooms.setCurrentPageNumber(room, 0)
    })*/

    socket.on('disconnecting', () => {
      const ioRooms = Object.keys(socket.rooms);
      const room = rooms.findRoomByName(ioRooms[1])
      rooms.decrementRoomConnection(room)
    });

    socket.on('disconnect', () => {
      io.emit('message', 'A user has left')
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


//                                                                                                  PDFJS Server
/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable object-shorthand */

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".xhtml": "application/xhtml+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".log": "text/plain",
  ".bcmap": "application/octet-stream",
  ".properties": "text/plain",
};

var defaultMimeType = "application/octet-stream";

function WebServer() {
  this.root = ".";
  this.host = "localhost";
  this.port = 0;
  this.server = null;
  this.verbose = false;
  this.cacheExpirationTime = 0;
  this.disableRangeRequests = false;
  this.hooks = {
    GET: [crossOriginHandler],
    POST: [],
  };
}

function start (callback) {
    ensureNonZeroPort();
    this.server = httpsServer // http.createServer(this._handler.bind(this));
    //this.server.listen(this.port, this.host, callback);
    //console.log("PDFJS Server running at http://" + this.host + ":" + this.port + "/");
    console.log("PDFJS Server running")
  }

function stop (callback) {
    this.server.close(callback);
    this.server = null;
  }

  function ensureNonZeroPort () {
    if (!this.port) {
      // If port is 0, a random port will be chosen instead. Do not set a host
      // name to make sure that the port is synchronously set by .listen().
      var server = http.createServer().listen(0);
      var address = server.address();
      // .address().port being available synchronously is merely an
      // implementation detail. So we are defensive here and fall back to some
      // fixed port when the address is not available yet.
      this.port = address ? address.port : 8000;
      server.close();
    }
  }

  function handler (req, res) {
    var url = req.url.replace(/\/\//g, "/");
    var urlParts = /([^?]*)((?:\?(.*))?)/.exec(url);
    try {
      // Guard against directory traversal attacks such as
      // `/../../../../../../../etc/passwd`, which let you make GET requests
      // for files outside of `this.root`.
      var pathPart = path.normalize(decodeURI(urlParts[1]));
      // path.normalize returns a path on the basis of the current platform.
      // Windows paths cause issues in statFile and serverDirectoryIndex.
      // Converting to unix path would avoid platform checks in said functions.
      pathPart = pathPart.replace(/\\/g, "/");
    } catch (ex) {
      // If the URI cannot be decoded, a `URIError` is thrown. This happens for
      // malformed URIs such as `http://localhost:8888/%s%s` and should be
      // handled as a bad request.
      res.writeHead(400);
      res.end("Bad request", "utf8");
      return;
    }
    var queryPart = urlParts[3];
    var verbose = this.verbose;

    var methodHooks = this.hooks[req.method];
    if (!methodHooks) {
      res.writeHead(405);
      res.end("Unsupported request method", "utf8");
      return;
    }
    var handled = methodHooks.some(function (hook) {
      return hook(req, res);
    });
    if (handled) {
      return;
    }

    if (pathPart === "/favicon.ico") {
      fs.realpath(
          path.join(this.root, "test/resources/favicon.ico"),
          checkFile
      );
      return;
    }

    var disableRangeRequests = this.disableRangeRequests;
    var cacheExpirationTime = this.cacheExpirationTime;

    var filePath;
    fs.realpath(path.join(this.root, pathPart), checkFile);

    function checkFile(err, file) {
      if (err) {
        res.writeHead(404);
        res.end();
        if (verbose) {
          console.error(url + ": not found");
        }
        return;
      }
      filePath = file;
      fs.stat(filePath, statFile);
    }

    var fileSize;

    function statFile(err, stats) {
      if (err) {
        res.writeHead(500);
        res.end();
        return;
      }

      fileSize = stats.size;
      var isDir = stats.isDirectory();
      if (isDir && !/\/$/.test(pathPart)) {
        res.setHeader("Location", pathPart + "/" + urlParts[2]);
        res.writeHead(301);
        res.end("Redirected", "utf8");
        return;
      }
      if (isDir) {
        serveDirectoryIndex(filePath);
        return;
      }

      var range = req.headers.range;
      if (range && !disableRangeRequests) {
        var rangesMatches = /^bytes=(\d+)-(\d+)?/.exec(range);
        if (!rangesMatches) {
          res.writeHead(501);
          res.end("Bad range", "utf8");
          if (verbose) {
            console.error(url + ': bad range: "' + range + '"');
          }
          return;
        }
        var start = +rangesMatches[1];
        var end = +rangesMatches[2];
        if (verbose) {
          console.log(url + ": range " + start + " - " + end);
        }
        serveRequestedFileRange(
            filePath,
            start,
            isNaN(end) ? fileSize : end + 1
        );
        return;
      }
      if (verbose) {
        console.log(url);
      }
      serveRequestedFile(filePath);
    }

    function escapeHTML(untrusted) {
      // Escape untrusted input so that it can safely be used in a HTML response
      // in HTML and in HTML attributes.
      return untrusted
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
    }

    function serveDirectoryIndex(dir) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);

      if (queryPart === "frame") {
        res.end(
            "<html><frameset cols=*,200><frame name=pdf>" +
            '<frame src="' +
            encodeURI(pathPart) +
            '?side"></frameset></html>',
            "utf8"
        );
        return;
      }
      var all = queryPart === "all";
      fs.readdir(dir, function (err, files) {
        if (err) {
          res.end();
          return;
        }
        res.write(
            '<html><head><meta charset="utf-8"></head><body>' +
            "<h1>PDFs of " +
            pathPart +
            "</h1>\n"
        );
        if (pathPart !== "/") {
          res.write('<a href="..">..</a><br>\n');
        }
        files.forEach(function (file) {
          var stat;
          var item = pathPart + file;
          var href = "";
          var label = "";
          var extraAttributes = "";
          try {
            stat = fs.statSync(path.join(dir, file));
          } catch (e) {
            href = encodeURI(item);
            label = file + " (" + e + ")";
            extraAttributes = ' style="color:red"';
          }
          if (stat) {
            if (stat.isDirectory()) {
              href = encodeURI(item);
              label = file;
            } else if (path.extname(file).toLowerCase() === ".pdf") {
              href = "/web/viewer.html?file=" + encodeURIComponent(item);
              label = file;
              extraAttributes = ' target="pdf"';
            } else if (all) {
              href = encodeURI(item);
              label = file;
            }
          }
          if (label) {
            res.write(
                '<a href="' +
                escapeHTML(href) +
                '"' +
                extraAttributes +
                ">" +
                escapeHTML(label) +
                "</a><br>\n"
            );
          }
        });
        if (files.length === 0) {
          res.write("<p>no files found</p>\n");
        }
        if (!all && queryPart !== "side") {
          res.write(
              "<hr><p>(only PDF files are shown, " +
              '<a href="?all">show all</a>)</p>\n'
          );
        }
        res.end("</body></html>");
      });
    }

    function serveRequestedFile(reqFilePath) {
      var stream = fs.createReadStream(reqFilePath, { flags: "rs" });

      stream.on("error", function (error) {
        res.writeHead(500);
        res.end();
      });

      var ext = path.extname(reqFilePath).toLowerCase();
      var contentType = mimeTypes[ext] || defaultMimeType;

      if (!disableRangeRequests) {
        res.setHeader("Accept-Ranges", "bytes");
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", fileSize);
      if (cacheExpirationTime > 0) {
        var expireTime = new Date();
        expireTime.setSeconds(expireTime.getSeconds() + cacheExpirationTime);
        res.setHeader("Expires", expireTime.toUTCString());
      }
      res.writeHead(200);

      stream.pipe(res);
    }

    function serveRequestedFileRange(reqFilePath, start, end) {
      var stream = fs.createReadStream(reqFilePath, {
        flags: "rs",
        start: start,
        end: end - 1,
      });

      stream.on("error", function (error) {
        res.writeHead(500);
        res.end();
      });

      var ext = path.extname(reqFilePath).toLowerCase();
      var contentType = mimeTypes[ext] || defaultMimeType;

      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", end - start);
      res.setHeader(
          "Content-Range",
          "bytes " + start + "-" + (end - 1) + "/" + fileSize
      );
      res.writeHead(206);

      stream.pipe(res);
    }
  }

// This supports the "Cross-origin" test in test/unit/api_spec.js
// It is here instead of test.js so that when the test will still complete as
// expected if the user does "gulp server" and then visits
// http://localhost:8888/test/unit/unit_test.html?spec=Cross-origin
function crossOriginHandler(req, res) {
  if (req.url === "/test/pdfs/basicapi.pdf?cors=withCredentials") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  if (req.url === "/test/pdfs/basicapi.pdf?cors=withoutCredentials") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }
}


start()
