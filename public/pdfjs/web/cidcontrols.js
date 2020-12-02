let myState = {
  pdf: undefined,
  currentPage: 1,
  zoom: 1
}

//called after PDFViewerApplication is initialized
function init(){
  console.log("Viewer initialized. Cid Controls active.");

  const roomName = window.location.pathname.substring(1)


  visualizePublicDoc(document.location.origin + '/docs/welcomeToCidReader.pdf')


  /*fetch('/fetch-document?url=' + document.location.origin + '/docs/welcome.pdf')
    .catch(err => console.log(err))
    .then(res => res.blob())
    .then(res => {

      PDFViewerApplication.open({
        url: URL.createObjectURL(res),
        originalUrl: "Welcome",
      }).catch(err => console.log(err))
    });
  */
  function uploadFile () {
      console.log("UploadFile")

    $('pdfUpload').submit(function () {
        $(this).ajaxSubmit({
          error: function (xhr) {
            console.log("An error occurred")
          },

          success: function (response) {
            //sendDataToServer(response)
            console.log("File successfully uploaded " + response)
          }
        });

        //Very important line, it disables the page refresh.
        return false;
      });
    };

  document.addEventListener(
    "keydown",
    function (event) {

      switch (event.code) {
        case "KeyA":

          sendDataToOthers("test")
          if (PDFViewerApplication.page > 1) {
            PDFViewerApplication.page--
            sendDataToOthers("changePage," + PDFViewerApplication.page)
          }
          break;

        case "KeyD":

          if (PDFViewerApplication.page < PDFViewerApplication.pagesCount) {
            PDFViewerApplication.page++
            sendDataToOthers("changePage," + PDFViewerApplication.page)
          }
          break;

        default:
          // default
          break;
      } // Consume the event so it doesn't get handled twice
      // event.preventDefault();
    },
    true
  );

  PDFViewerApplication.eventBus.on("fileinputchange", (evt)=> {
    const file = evt.fileInput.files[0];
    console.log("Loaded " + file)

    const formData = new FormData();
    formData.append('docUpload', file);

    $.ajax({
      url: 'pdfUpload' + '?roomname=' + roomName,
      type: 'POST',
      processData: false, // important
      contentType: false, // important
      dataType : 'docUpload',
      data: formData
    });

    uploadFile();

  });

  //this duplicated code should be refactored
  function visualizeDoc(documentLink) {
    console.log("VisualizeDoc " + documentLink)

    fetch('/get-document?url=' + documentLink + '&roomname=' + roomName)
      .catch(err => console.log(err))
      .then(res => res.blob())
      .then(res => {

        PDFViewerApplication.open({
          url: URL.createObjectURL(res),
          originalUrl: "test",
        }).catch(err => console.log(err))
      });
  }

  function visualizePublicDoc(documentLink) {
    console.log("VisualizeDoc " + documentLink)

    PDFViewerApplication.open({
      url: documentLink,
      originalUrl: "Welcome To Cid Reader",
    }).catch(err => console.log(err))
  }

  let counter = 0;
  let cidPages = [];
  let pdfPages = [];
  PDFViewerApplication.eventBus.on("fileinputchange", ()=>{
    counter = 0;
  })

  function getPages(){
    pdfPages = document.querySelectorAll(".page");
  }

  PDFViewerApplication.eventBus.on('pagerendered', ()=> {
    counter++;
    //console.log('pagerendered ' + counter);

    if (counter < PDFViewerApplication.pagesCount) {
      //wait or do something while loading
    } else {
      getPages()
      console.log("last page rendered ")
      //do things with pages canvases
      pdfPages.forEach((item, index) => {

        const cidCanvas = document.createElement('canvas');
        cidCanvas.id = 'cidCanvas';

        document.body.appendChild(cidCanvas); // adds the canvas to the body element
        item.appendChild(cidCanvas); // adds the canvas to #someBox

        cidCanvas.style.position = 'absolute';
        cidCanvas.style.top = '0px';
        cidCanvas.style.left = '0px';

        const ctx = cidCanvas.getContext('2d')

        cidCanvas.width = item.clientWidth;
        cidCanvas.height = item.clientHeight;
        cidPages.push(cidCanvas)

        cidCanvas.addEventListener('mousemove', function (e) {

          //ctx.clearRect(0, 0, canvas.width, canvas.height);
          const cRect = cidCanvas.getBoundingClientRect();        // Gets CSS pos, and width/height
          const canvasX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
          const canvasY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
          ctx.clearRect(0, 0, cidCanvas.width, cidCanvas.height);  // (0,0) the top left of the canvas
          //ctx.fillText("X: " + canvasX / cidCanvas.width + ", Y: " + canvasY / cidCanvas.height, 10, 20);
          //ctx.fillRect(canvasX, canvasY, 20, 20)

          const posX = canvasX / cidCanvas.width
          const posY = canvasY / cidCanvas.height
          //ctx.fillText("X: " + posX + ", Y: " + posX, 10, 20);
          ctx.fillRect(posX * cidCanvas.width, posY * cidCanvas.height, 20, 20)
          sendDataToOthers(JSON.stringify("pointerPosition,"+ index + "," + posX + "," + posY))
        });
      })
    }
  });

  function drawRemotePointer(pageNumber, posX, posY){
    const ctx = cidPages[pageNumber].getContext('2d');
    ctx.clearRect(0, 0, cidPages[pageNumber].width, cidPages[pageNumber].height);  // (0,0) the top left of the canvas
    //ctx.fillText("X: "+posX+", Y: "+posX, 10, 20);
    ctx.fillRect(posX * cidPages[pageNumber].width, posY * cidPages[pageNumber].height,20,20)
  }
  //                                                                                                       REALTIME_COM

  const socket = io()

  console.log('room name = ' + roomName)

  socket.emit('join', roomName)

  socket.on('signalchannel', (data) => {
    if (data != undefined && data != null) {

      if (isJson(data)) {
        data = JSON.parse(data.toString())
      } else {
        console.log('sendData received non JSON data: ' + data)
      }

      //console.log(data)

      const cmd = data.split(",");

      switch (cmd[0]) {
        case "changeDocument":
          myState.pdf = cmd[1];
          //startDoc();
          visualizeDoc(myState.pdf)
          //console.log("RECV: Visualizing new document " + myState.pdf);
          break;
        case "visualizePublic":
          myState.pdf = cmd[1];
          //startDoc();
          //visualizePublicDoc(myState.pdf.toString())
          //console.log("RECV: Visualizing new public document " + myState.pdf);
          break;

        default:
          console.log('RECV msg ' + data)
      }
    }
  })

  socket.on('datachannel', (data) => {

    if (data != undefined && data != null) {

      if (isJson(data)) {
        data = JSON.parse(data.toString())
      } else {
        console.log('sendData received non JSON data: ' + data)
      }

      //console.log(data)

      const cmd = data.split(",");

      switch (cmd[0]) {
        case "changePage":
          PDFViewerApplication.page = parseInt(cmd[1])
          break;

        case "pointerPosition":
          drawRemotePointer(parseFloat(cmd[1]), parseFloat(cmd[2]), parseFloat(cmd[3]))
          break;

        default:
          //console.log('RECV msg ' + data)
      }
    }
  })

  function sendDataToOthers(dataString) {
    socket.emit('datachannel', roomName, dataString)
  }

  function sendDataToServer(dataString) {
    socket.emit('signalchannel', roomName, dataString)
  }

  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }



}
export { init }
