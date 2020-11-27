console.log("Cid Controls Active")

let myState = {
  pdf: undefined,
  currentPage: 1,
  zoom: 1
}

document.addEventListener(
    "keydown",
    function(event) {
      // if (event.defaultPrevented) {
      // return; // Do nothing if event already handled
      // }
      switch (event.code) {
        case "KeyA":
          // Handle "left"
          //webViewerPreviousPage();
          //eventBus.dispatch('previouspage');
          sendDataToOthers("test")
          //PDFViewerApplication.pdfViewer.eventBus.dispatch("previouspage")
          if(PDFViewerApplication.page > 1) {
            PDFViewerApplication.page--
            sendDataToOthers("changePage," + PDFViewerApplication.page)
          }
          break;

        case "KeyD":
          // Handle "left"
          //webViewerNextPage();
          //eventBus.dispatch('nextpage');

          console.log(PDFViewerApplication.pagesCount)

          if(PDFViewerApplication.page < PDFViewerApplication.pagesCount) {
            PDFViewerApplication.page++
            sendDataToOthers("changePage," + PDFViewerApplication.page)
          }
          //PDFViewerApplication.pdfViewer.eventBus.dispatch("nextpage")
          break;

        case "KeyL":
          PDFViewerApplication.open('doc.pdf').then() //this opens a file by its url
          break;
        default:
          // default
          break;
      } // Consume the event so it doesn't get handled twice
      // event.preventDefault();
    },
    true
  );



const roomName = window.location.pathname.substring(1)
console.log('roomName is ' + roomName)

function startDoc() {

  const documentLink = document.getElementById("documentLink").value;
  console.log("StartDoc " + documentLink)
  sendDataToServer(documentLink)
}

//this duplicated code should be refactored
function visualizeDoc(documentLink){
  console.log("VisualizeDoc " + documentLink)

  fetch('/get-documentttt?url=' + documentLink + '&roomname=' + roomName)
    .catch(err => console.log(err))
    //.then(res => res.json())
    .then(res => {

      /*pdfjsLib.getDocument(res).then((pdf) => {
        myState.pdf = pdf;
        //myState.currentPage = 1;
        myState.zoom = 1;
        document.getElementById("current_page").value = myState.currentPage;
        render()

      }).catch((e) => {
        console.log('Error', e);
      })*/
    });
}

//this duplicated code should be refactored
function visualizePublicDoc(documentLink){
  console.log("VisualizeDoc " + documentLink)
  /*pdfjsLib.getDocument(documentLink).then((pdf) => {
    myState.pdf = pdf;
    //myState.currentPage = 1;
    myState.zoom = 1;
    document.getElementById("current_page").value = myState.currentPage;
    render()
    //getDocumentRatio

  }).catch((e) => {
    console.log('Error', e);
  })*/
}



function startUploadedDoc() {
  //document.getElementById('uploadForm').action = '/pdfupload' + '?roomname=' + roomName
  //var documentLink = document.getElementById("fileUpload").files[0].name;
  //more about this function is actually executed in room.hbs
}


const socket = io()

console.log('room name = ' + roomName)

socket.emit('join', roomName)

socket.on('signalchannel', (data) =>  {
  //datachannel
  /*if (!users[id]) {
      users[id] = new user()
  }*/
  if(data != undefined && data != null) {

    if(isJson(data)) {
      data = JSON.parse(data.toString())
    }
    else{
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
        visualizePublicDoc(myState.pdf)
        console.log("RECV: Visualizing new public document " + myState.pdf);
        break;
      default:
        console.log('RECV msg ' + data)
    }
  }
})

socket.on('datachannel', (data) =>  {
  //datachannel
  /*if (!users[id]) {
      users[id] = new user()
  }*/
  if(data != undefined && data != null) {

    if(isJson(data)) {
      data = JSON.parse(data.toString())
    }
    else{
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

function sendDataToOthers(dataString){
  socket.emit('datachannel', roomName, dataString)
}

function sendDataToServer(dataString){
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



