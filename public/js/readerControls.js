var myState = {
    pdf: null,
    currentPage: 1,
    zoom: 1
}

const roomName = window.location.pathname
console.log('roomName is ' + roomName)

document.getElementById('zoom_in')
    .addEventListener('click', (e) => {
        if(myState.pdf == null) return;
        myState.zoom += 0.5;
        render();
    });

document.getElementById('zoom_out')
    .addEventListener('click', (e) => {
        if(myState.pdf == null) return;
        myState.zoom -= 0.5;
        render();
    });

function startDoc() {

    var documentLink = document.getElementById("documentLink").value;
    console.log("StartDoc " + documentLink)

    fetch('/get-document?url=' + documentLink + '&roomname=' + roomName)
        .catch(err => console.log(err))
        .then(res => res.json())
        .then(res => {
            console.log('startdoc ricevuto ' + res.url)

            window.history.replaceState(null, null, "?docURL=" + "\"" + res.url + "\"" );

            /*pdfjsLib.getDocument(res.url).then((pdf) => {
                myState.pdf = pdf;

                myState.currentPage = 1;
                myState.zoom = 1;

                document.getElementById("current_page").value = myState.currentPage;

                // more code here
                //console.log("render from start doc - load")
                render()
            }).catch((e) => {
                console.log('Error', e)
            })*/

        });
    }


    //this duplicated code should be refactored
    function visualizeDoc(documentLink){
        console.log("VisualizeDoc " + documentLink)

        fetch('/get-document?url=' + documentLink)
            .catch(err => console.log(err))
            .then(res => res.json())
            .then(res => {
                window.history.replaceState(null, null, "?docURL=" + "\"" + res.url + "\"" );
                pdfjsLib.getDocument(res.url).then((pdf) => {
                    myState.pdf = pdf;

                    myState.currentPage = 1;
                    myState.zoom = 1;

                    document.getElementById("current_page").value = myState.currentPage;

                    // more code here
                    //console.log("render from visualize doc - load")
                    render()
                }).catch((e) => {
                    console.log('Error', e);
                })

            });
    }

function startUploadedDoc() {
    var documentLink = document.getElementById("fileUpload").files[0].name;
    //more about this function is actually exectuded in room.hbs
}

function render() {
    myState.pdf.getPage(myState.currentPage).then((page) => {

        // more code here
        var canvasContainer = document.getElementById("canvas_container");
        var canvas = document.getElementById("pdf_renderer");
        var ctx = canvas.getContext('2d');

        //var viewport = page.getViewport(myState.zoom);
        var viewport = page.getViewport((canvasContainer.getBoundingClientRect().width / page.getViewport(1.0).width) * myState.zoom * 0.97 );

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({
            canvasContext: ctx,
            viewport: viewport
        });

        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
        }
    });

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Network part, soon to be moved to another file

const socket = io()

console.log('room name = ' + roomName)

socket.emit('join', roomName)

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
            case "changeDocument":
                myState.pdf = cmd[1];
                //startDoc();
                visualizeDoc(myState.pdf)
                console.log("RECV: Visualizing new document " + myState.pdf);
                break;

            case "goForward":
                myState.currentPage = parseInt(cmd[1]);
                document.getElementById("current_page").value = myState.currentPage;
                render();
                console.log("RECV: turnPage " + cmd[1] + " " + myState.currentPage);
                break;

            case "goBackward":
                myState.currentPage = parseInt(cmd[1]);
                document.getElementById("current_page").value = myState.currentPage;
                render();
                console.log("RECV: turnPage " + cmd[1] + " " + myState.currentPage);
                break;

            default:
                console.log('RECV msg' + data)
        }
    }
})

function cid_go_previous (){
    if(myState.pdf == null
        || myState.currentPage == 1)
        return;

    myState.currentPage -= 1;
    document.getElementById("current_page")
        .value = myState.currentPage;
    //console.log("render from visualize doc - go previous")
    render()

    let dataString = JSON.stringify('goBackward,' + myState.currentPage)
    console.log("SEND: " + dataString)

    sendDataToOthers(dataString)
}

function cid_go_next(){
    if(myState.pdf == null || myState.currentPage >= myState.pdf._pdfInfo.numPages)
        return;

    myState.currentPage += 1;
    document.getElementById("current_page")
        .value = myState.currentPage;
    //console.log("render from visualize doc - go next")
    render()

    let dataString = JSON.stringify('goForward,' + myState.currentPage)
    console.log("SEND: " + dataString)

    sendDataToOthers(dataString)
}

function sendDataToOthers(dataString){
    socket.emit('datachannel', window.location.pathname, dataString)
}

document.getElementById('go_previous')
    .addEventListener('click', (e) => {
        cid_go_previous()
    });

document.addEventListener("keydown", function(event) {
    //if (event.defaultPrevented) {
    // return; // Do nothing if event already handled
    //}
    switch(event.code) {
        case "ArrowLeft":
            // Handle "left"
            cid_go_previous()
            break;
        case "KeyA":
            // Handle "left"
            cid_go_previous()
            break;
        default:
            //default
            break;
    }    // Consume the event so it doesn't get handled twice
    //event.preventDefault();
}, true);

document.getElementById('go_next')
    .addEventListener('click', (e) => {
        cid_go_next()
    });

document.addEventListener("keydown", function(event) {
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
}, true);


document.getElementById('changeDocument')
    .addEventListener('click', (e) => {
        let documentLink = document.getElementById('documentLink').value
        console.log('SEND: ' + 'changing document')
        let dataString = JSON.stringify('changeDocument,' + documentLink)

        sendDataToOthers(dataString)
    });

document.getElementById('changeUploadedDocument')
    .addEventListener('click', (e) => {
        //let documentLink = 'https://127.0.0.1/fdf_data_exchange.pdf'
        //console.log('SEND: ' + 'changing document')
        //let dataString = JSON.stringify('changeDocument,' + documentLink)

    });


function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}