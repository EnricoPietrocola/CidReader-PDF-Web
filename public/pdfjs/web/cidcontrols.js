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

