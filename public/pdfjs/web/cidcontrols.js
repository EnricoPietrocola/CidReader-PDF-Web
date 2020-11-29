let myState = {
  pdf: undefined,
  currentPage: 1,
  zoom: 1
}

//called after PDFViewerApplication is initialized
function init(){
  console.log("Viewer initialized. Cid Controls active.");

  const roomName = window.location.pathname.substring(1)
  //console.log('roomName is ' + roomName)

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

  fetch('/fetch-document?url=' + 'https://cidreader.com/docs/welcome.pdf')
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
          //visualizeDoc('https://127.0.0.1/docs/fdf.pdf')
          //PDFViewerApplication.open('/uploads/doc.pdf').then() //this opens a file by its url
          //sendDataToOthers('visualizePublic,' + 'https://127.0.0.1/docs/welcomeToCidReader.pdf')
          break;
        default:
          // default
          break;
      } // Consume the event so it doesn't get handled twice
      // event.preventDefault();
    },
    true
  );




  /*function startDoc() {
    const documentLink = document.getElementById("documentLink").value;
    console.log("StartDoc " + documentLink)
    sendDataToServer(documentLink)
  }*/

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

  const socket = io()

  console.log('room name = ' + roomName)

  socket.emit('join', roomName)

  socket.on('signalchannel', (data) => {
    //datachannel
    /*if (!users[id]) {
        users[id] = new user()
    }*/
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
    //datachannel
    /*if (!users[id]) {
        users[id] = new user()
    }*/
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
          //myState.currentPage = parseInt(cmd[1]);
          console.log('is this happening?')
          PDFViewerApplication.page = parseInt(cmd[1])
          //console.log("RECV: turnPage " + cmd[1] + " " + myState.currentPage);
          break;

        case "pointerPosition":
          drawPointer(parseFloat(cmd[1]), parseFloat(cmd[2]))
          break;

        default:
          console.log('RECV msg ' + data)
      }
    }
  })

  /*function cid_go_previous (){
    if(myState.pdf == null
      || myState.currentPage == 1)
      return;

    myState.currentPage -= 2;
    document.getElementById("current_page")
      .value = myState.currentPage;
    //console.log("render from visualize doc - go previous")
    render()

    let dataString = JSON.stringify('changePage,' + myState.currentPage)
    console.log("SEND: " + dataString)

    sendDataToOthers(dataString)
  }*/

  /*function cid_go_next(){
    if(myState.pdf == null || myState.currentPage >= myState.pdf._pdfInfo.numPages)
      return;

    myState.currentPage += 2;
    document.getElementById("current_page")
      .value = myState.currentPage;
    //console.log("render from visualize doc - go next")
    render()

    let dataString = JSON.stringify('changePage,' + myState.currentPage)
    console.log("SEND: " + dataString)

    sendDataToOthers(dataString)
  }*/

  function sendDataToOthers(dataString) {
    socket.emit('datachannel', roomName, dataString)
  }

  function sendDataToServer(dataString) {
    socket.emit('signalchannel', roomName, dataString)
  }

  /*document.getElementById('go_previous')
    .addEventListener('click', (e) => {
      cid_go_previous()
    });*/


  /*document.getElementById('go_next')
    .addEventListener('click', (e) => {
      cid_go_next()
    });*/

  /*document.addEventListener("keydown", function(event) {
    //if (event.defaultPrevented) {
    // return; // Do nothing if event already handled
    //}
    switch(event.code) {
      case "ArrowRight":
        // Handle "right"
        cid_go_next()
        break;
      case "KeyD":
        // Handle "right"
        cid_go_next()
        break;
      default:
        //default
        break;
    }    // Consume the event so it doesn't get handled twice
    //event.preventDefault();
  }, true);*/


  //                                                                                                                  CHANGE DOCUMENT

  /*document.getElementById('changeDocument')
    .addEventListener('click', (e) => {
      let documentLink = document.getElementById('documentLink').value
      console.log('SEND: ' + 'changing document')
      let dataString = JSON.stringify('changeDocument,' + documentLink)

      sendDataToOthers(dataString)
    });*/

  //                                                                                                                  CHANGE UPLOADED DOCUMENT

  /*document.getElementById('changeUploadedDocument')
      .addEventListener('click', (e) => {
          //let documentLink = 'https://127.0.0.1/fdf_data_exchange.pdf'
          //console.log('SEND: ' + 'changing document')
          //let dataString = JSON.stringify('changeDocument,' + documentLink)
      });
  */

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

