let myState = {
  pdf: undefined,
  currentPage: 1,
  zoom: 1
}

//called after PDFViewerApplication is initialized
function init(){
  console.log("Viewer initialized. Cid Controls active.");

  const roomName = window.location.pathname.substring(1)

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



  fetch('/fetch-document?url=' + document.location.origin + '/docs/welcome.pdf')
    .catch(err => console.log(err))
    .then(res => res.blob())
    .then(res => {

      PDFViewerApplication.open({
        url: URL.createObjectURL(res),
        originalUrl: "Welcome",
      }).catch(err => console.log(err))
    });

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

        case "KeyL":
          cidPages.forEach((item, index) => {
            const ctx = item.getContext('2d')
            console.log('adding event listeners')
            item.addEventListener('mousemove', function (e) {
              console.log("happening?")
              //ctx.clearRect(0, 0, canvas.width, canvas.height);
              console.log(e.clientX)
              console.log(e.clientY)

              const cRect = item.getBoundingClientRect();        // Gets CSS pos, and width/height
              const canvasX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
              const canvasY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
              ctx.clearRect(0, 0, item.width, item.height);  // (0,0) the top left of the canvas
              ctx.fillText("X: " + canvasX / item.width + ", Y: " + canvasY / item.height, 10, 20);
              ctx.fillRect(canvasX, canvasY, 20, 20)

              const posX = canvasX / item.width
              const posY = canvasY / item.height

              ctx.fillText("X: " + posX + ", Y: " + posX, 10, 20);
              ctx.fillRect(posX * item.width, posY * item.height, 20, 20)
              //sendDataToOthers("pointerPosition," + posX + "," + posY)
            });
          })
          break;
        default:
          // default
          break;
      } // Consume the event so it doesn't get handled twice
      // event.preventDefault();
    },
    true
  );

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

  let counter = 0;
  let cidLayers;
  let cidPages = new Array();
  let pdfPages = new Array();
  PDFViewerApplication.eventBus.on("fileinputchange", ()=>{
    counter = 0;
  })

  function getPages(){
    //const queryValue = 'Page ' + counter;
    //const page = document.querySelector('[aria-label="' + queryValue + '"]');
    console.log('[ div.page data-page-number="' + counter + '"]')

    //const page = document.querySelector('[.page] [data-page-number="' + counter + '"]');
    pdfPages = document.querySelectorAll(".page");
    /*
    //create an array of overlayed pages
    const layer = page.cloneNode(true)
    layer.id("CidLayer" + counter);
    layer.classList.add('text-large');
    page.after(layer)
    cidLayers.push(layer)
    */
    console.log(pdfPages)
    //create an array of pages (canvases)
    //cidPages.push(page)

    /*
    const cidCanvas = document.createElement('canvas');
    cidCanvas.id = 'cidCanvas';

    document.body.appendChild(cidCanvas); // adds the canvas to the body element
    page.appendChild(cidCanvas); // adds the canvas to #someBox
    */


    //const ctx = page.getContext('2d');
    //ctx.fillStyle = "blue";
    //ctx.fillRect(0, 0, page.width, page.height);
  }

  PDFViewerApplication.eventBus.on('pagerendered', ()=> {
    counter++;
    console.log('pagerendered ' + counter);

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
          ctx.fillText("X: " + canvasX / cidCanvas.width + ", Y: " + canvasY / cidCanvas.height, 10, 20);
          ctx.fillRect(canvasX, canvasY, 20, 20)

          const posX = canvasX / cidCanvas.width
          const posY = canvasY / cidCanvas.height
          ctx.fillText("X: " + posX + ", Y: " + posX, 10, 20);
          ctx.fillRect(posX * cidCanvas.width, posY * cidCanvas.height, 20, 20)
          //sendDataToOthers("pointerPosition," + posX + "," + posY)
        });
      })
    }
  });


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

      console.log(data)

      const cmd = data.split(",");

      switch (cmd[0]) {
        case "changeDocument":
          myState.pdf = cmd[1];
          //startDoc();
          visualizeDoc(myState.pdf)
          console.log("RECV: Visualizing new document " + myState.pdf);
          break;
        case "visualizePublic":
          myState.pdf = cmd[1];
          //startDoc();
          //visualizePublicDoc(myState.pdf.toString())
          console.log("RECV: Visualizing new public document " + myState.pdf);
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

      console.log(data)

      const cmd = data.split(",");

      switch (cmd[0]) {
        case "changePage":
          PDFViewerApplication.page = parseInt(cmd[1])
          break;

        case "pointerPosition":
          drawPointer(parseFloat(cmd[1]), parseFloat(cmd[2]))
          break;

        default:
          console.log('RECV msg ' + data)
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

/*
    eventBus._on("resize", webViewerResize);
    eventBus._on("hashchange", webViewerHashchange);
    eventBus._on("beforeprint", _boundEvents.beforePrint);
    eventBus._on("afterprint", _boundEvents.afterPrint);
    eventBus._on("pagerendered", webViewerPageRendered);
    eventBus._on("updateviewarea", webViewerUpdateViewarea);
    eventBus._on("pagechanging", webViewerPageChanging);
    eventBus._on("scalechanging", webViewerScaleChanging);
    eventBus._on("rotationchanging", webViewerRotationChanging);
    eventBus._on("sidebarviewchanged", webViewerSidebarViewChanged);
    eventBus._on("pagemode", webViewerPageMode);
    eventBus._on("namedaction", webViewerNamedAction);
    eventBus._on("presentationmodechanged", webViewerPresentationModeChanged);
    eventBus._on("presentationmode", webViewerPresentationMode);
    eventBus._on("print", webViewerPrint);
    eventBus._on("download", webViewerDownload);
    eventBus._on("save", webViewerSave);
    eventBus._on("firstpage", webViewerFirstPage);
    eventBus._on("lastpage", webViewerLastPage);
    eventBus._on("nextpage", webViewerNextPage);
    eventBus._on("previouspage", webViewerPreviousPage);
    eventBus._on("zoomin", webViewerZoomIn);
    eventBus._on("zoomout", webViewerZoomOut);
    eventBus._on("zoomreset", webViewerZoomReset);
    eventBus._on("pagenumberchanged", webViewerPageNumberChanged);
    eventBus._on("scalechanged", webViewerScaleChanged);
    eventBus._on("rotatecw", webViewerRotateCw);
    eventBus._on("rotateccw", webViewerRotateCcw);
    eventBus._on("optionalcontentconfig", webViewerOptionalContentConfig);
    eventBus._on("switchscrollmode", webViewerSwitchScrollMode);
    eventBus._on("scrollmodechanged", webViewerScrollModeChanged);
    eventBus._on("switchspreadmode", webViewerSwitchSpreadMode);
    eventBus._on("spreadmodechanged", webViewerSpreadModeChanged);
    eventBus._on("documentproperties", webViewerDocumentProperties);
    eventBus._on("find", webViewerFind);
    eventBus._on("findfromurlhash", webViewerFindFromUrlHash);
    eventBus._on("updatefindmatchescount", webViewerUpdateFindMatchesCount);
    eventBus._on("updatefindcontrolstate", webViewerUpdateFindControlState);
 */
/*
page.addEventListener("mousemove", function(e) {
  console.log("happening?")
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cRect = page.getBoundingClientRect();        // Gets CSS pos, and width/height
  const canvasX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
  const canvasY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
  ctx.clearRect(0, 0, page.width, page.height);  // (0,0) the top left of the canvas
  ctx.fillText("X: "+canvasX / page.width+", Y: "+canvasY / page.height, 10, 20);
  ctx.fillRect(canvasX,canvasY,20,20)

  const posX = canvasX / page.width
  const posY = canvasY / page.height
  ctx.fillText("X: "+posX+", Y: "+posX, 10, 20);
  ctx.fillRect(posX * page.width, posY * page.height,20,20)
  //sendDataToOthers("pointerPosition," + posX + "," + posY)
});
})*/
