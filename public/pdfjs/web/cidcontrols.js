let myState = {
  pdf: undefined,
  currentPage: 1,
  zoom: 1
}

//called after PDFViewerApplication is initialized
function init(){
  console.log("Viewer initialized. Cid Controls active.");
  const socket = io()
  const roomName = window.location.pathname.substring(1)

  //create text field to visualize some messages
  const toolbar = document.getElementById("toolbarViewer")
  const cidInfo = document.createElement('p');
  document.body.appendChild(cidInfo); // adds the canvas to the body element
  toolbar.appendChild(cidInfo); // adds the canvas to div

  let pdfPages = [];
  let cidPages = []
  visualizePublicDoc(document.location.origin + '/docs/welcometocidreader.pdf')

  document.addEventListener(
    "keydown",
    function (event) {

      switch (event.code) {
        case "KeyA":

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

  PDFViewerApplication.eventBus.on('openfile', (evt)=>{

  })
  //triggered when user inputs a new document
  PDFViewerApplication.eventBus.on("fileinputchange", (evt)=> {
    const file = evt.fileInput.files[0];
    console.log('Sending pdf to server')
    const formData = new FormData();
    formData.append('docUpload', file);

    $.ajax({
      xhr: function()
      {
        const xhr = new window.XMLHttpRequest();
        //Upload progress
        xhr.upload.addEventListener("progress", function(evt){
          if (evt.lengthComputable) {
            const percentComplete = evt.loaded / evt.total;
            cidInfo.textContent = "Uploading " + Math.trunc(percentComplete * 100);
          }
        }, false);
        //Download progress
        xhr.addEventListener("progress", function(evt){
          if (evt.lengthComputable) {
            const percentComplete = evt.loaded / evt.total;
            //Do something with download progress
            //console.log(percentComplete);
          }
        }, false);
        return xhr;
      },
      type: 'POST',
      url: 'pdfUpload' + '?roomname=' + roomName + '&socket=' + socket.id,
      processData: false, // important
      contentType: false, // important
      dataType : 'docUpload',
      data: formData,
      success: function(data){
      }
    });
    sendDataToOthers("A user initiated a document change")
  });

  //this duplicated code should be refactored
  function visualizeDoc(documentLink) {
    //console.log("VisualizeDoc " + documentLink)
    fetch('/get-document?url=' + documentLink + '&roomname=' + roomName)
      .catch(err => console.log(err))
      .then(res => res.blob())
      .then(res => {

        PDFViewerApplication.open({
          url: URL.createObjectURL(res),
          originalUrl: "CidReader",
        }).catch(err => console.log(err))
      });
  }

  function visualizePublicDoc(documentLink) {
    //console.log("VisualizeDoc " + documentLink)

    PDFViewerApplication.open({
      url: documentLink,
      originalUrl: "Welcome To Cid Reader",
    }).catch(err => console.log(err))

  }

  function getPages(){

    pdfPages = document.querySelectorAll(".page");
  }

  PDFViewerApplication.eventBus.on('hashchange',(evt) => {
    console.log('hashchange')
    console.log(evt)
  })

  PDFViewerApplication.eventBus.on('pagerendered', (evt)=> {
    const pageNumber = evt.pageNumber - 1;
    getPages()

    //add a listener on page to detect mouse over page
    const pdfPage = pdfPages[pageNumber];

    //create a canvas, add it to page div and draw something on given position
    const cidCanvas = document.createElement('canvas');
    cidPages[pageNumber] = cidCanvas;
    document.body.appendChild(cidCanvas); // adds the canvas to the body element
    pdfPage.appendChild(cidCanvas); // adds the canvas to div
    //overlap page
    cidCanvas.id = 'cidCanvas';
    cidCanvas.style.position = 'absolute';
    cidCanvas.style.top = '0px';
    cidCanvas.style.left = '0px';

    const ctx = cidCanvas.getContext('2d')

    //resize to match page size
    cidCanvas.width = pdfPage.clientWidth;
    cidCanvas.height = pdfPage.clientHeight;

    pdfPage.addEventListener("mousemove", (e)=> {
      const cRect = pdfPage.getBoundingClientRect();        // Gets CSS pos, and width/height
      const canvasX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
      const canvasY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
      const posX = canvasX / pdfPage.clientWidth
      const posY = canvasY / pdfPage.clientHeight

      //draw pointer
      ctx.clearRect(0, 0, cidCanvas.width, cidCanvas.height);  // (0,0) the top left of the canvas
      //ctx.fillRect(posX * cidCanvas.width, posY * cidCanvas.height, 20, 20)

      ctx.fillStyle = "rgba(255, 30, 30, 0.7)";
      ctx.beginPath();
      ctx.arc((posX * cidCanvas.width) - 8, (posY  * cidCanvas.height) - 8, 8, 0, 2 * Math.PI);
      ctx.fill()
      //send remote pointer draw call
      sendDataToOthers("pointerPosition," + pageNumber + "," + posX + "," + posY)
    })
  });

  function drawRemotePointer(pageNumber, posX, posY){
    const page = cidPages[pageNumber]
    if(page !== undefined) {
      const ctx = page.getContext('2d');
      if(ctx !== undefined) {
        ctx.clearRect(0, 0, cidPages[pageNumber].width, cidPages[pageNumber].height);  // (0,0) the top left of the canvas
        //ctx.fillRect(posX * cidPages[pageNumber].width, posY * cidPages[pageNumber].height, 20, 20)
        ctx.fillStyle = "rgba(255, 30, 30, 0.7)";
        ctx.beginPath();
        ctx.arc((posX * cidPages[pageNumber].width) - 8, (posY  * cidPages[pageNumber].height) - 8, 8, 0, 2 * Math.PI);
        ctx.fill()
      }
    }
  }


  //                                                                                                       REALTIME_COM

  //console.log('room name = ' + roomName)
  socket.emit('join', roomName)

  /*socket.on('signalchannel', (data) => {
    if (data !== undefined && data !== null) {


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
          console.log('RECV unknown msg ' + data)
      }
    }
  })*/

  socket.on('datachannel', (data) => {

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
          PDFViewerApplication.page = parseInt(cmd[1])
          break;

        case "pointerPosition":
          drawRemotePointer(parseFloat(cmd[1]), parseFloat(cmd[2]), parseFloat(cmd[3]))
          break;

        case "notifyDocLink":
          myState.pdf = cmd[1];
          sendDataToOthers('changeDocument,' + myState.pdf)
          break;

        case "changeDocument":
          myState.pdf = cmd[1];
          //startDoc();
          visualizeDoc(myState.pdf)
          //console.log("RECV: Visualizing new document " + myState.pdf);
          break;
        default:
          console.log('RECV unknown msg ' + data)
      }
    }
  })

  function sendDataToOthers(dataString) {
    socket.emit('datachannel', roomName, JSON.stringify(dataString))
  }

  /*function sendDataToServer(dataString) {
    socket.emit('signalchannel', roomName, JSON.stringify(dataString))
  }*/

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
