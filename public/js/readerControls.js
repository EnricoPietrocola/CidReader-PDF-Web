"use strict";

let myState = {
    pdf: undefined,
    currentPage: 1,
    zoom: 1
}

const roomName = window.location.pathname.substring(1)
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

            pdfjsLib.getDocument(res).then((pdf) => {
                myState.pdf = pdf;
                //myState.currentPage = 1;
                myState.zoom = 1;
                document.getElementById("current_page").value = myState.currentPage;
                render()

            }).catch((e) => {
                console.log('Error', e);
            })
        });
}

//this duplicated code should be refactored
function visualizePublicDoc(documentLink){
    console.log("VisualizeDoc " + documentLink)
        pdfjsLib.getDocument(documentLink).then((pdf) => {
            myState.pdf = pdf;
            //myState.currentPage = 1;
            myState.zoom = 1;
            document.getElementById("current_page").value = myState.currentPage;
            render()
            //getDocumentRatio

        }).catch((e) => {
            console.log('Error', e);
        })
}



function startUploadedDoc() {
    document.getElementById('uploadForm').action = '/pdfupload' + '?roomname=' + roomName
    var documentLink = document.getElementById("fileUpload").files[0].name;
    //more about this function is actually executed in room.hbs
}


function render() {
    try {
        if (myState.pdf !== undefined && myState.pdf !== '') {
            myState.pdf.getPage(myState.currentPage).then((page) => {

                const canvasContainer = document.getElementById("canvas_container");
                const canvas = document.getElementById("pdf_renderer");
                const ctx = canvas.getContext('2d');

                const viewport = page.getViewport((canvasContainer.getBoundingClientRect().width / page.getViewport(1.0).width) * myState.zoom * 0.97);

                canvas.height = window.innerHeight //canvasContainer.clientHeight;
                const ratio = viewport.width / viewport.height
                console.log(ratio)
                canvas.width = canvas.height * ratio
                canvasContainer.style.width = canvasContainer.clientHeight * ratio+"px"
                //canvasContainer.getBoundingClientRect().height = canvas.height
                // Make it visually fill the positioned parent


                /*canvas.style.width ='100%';
                canvas.style.height='100%';
                // ...then set the internal size to match
                canvas.width  = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;*/

                resizeCanvas()

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
    }
    catch (e) {
        //console.log(e)
    }
}

function displayWindowSize(){
    // Get width and height of the window excluding scrollbars
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;

    // Display result inside a div element
    console.log("Width: " + w + ", " + "Height: " + h)
    myState.zoom = 1
    //render()
    //document.getElementById("result").innerHTML = "Width: " + w + ", " + "Height: " + h;
}

// Attaching the event listener function to window's resize event
window.addEventListener("resize", displayWindowSize);

const ro = new ResizeObserver(entries => {
    for (let entry of entries) {
        const cr = entry.contentRect;
        render()
    }
});

//even listener for canvas container size changes
ro.observe(document.getElementById("canvas_container"));


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Network part, soon to be moved to another file

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
                myState.currentPage = parseInt(cmd[1]);
                document.getElementById("current_page").value = myState.currentPage;
                render();
                console.log("RECV: turnPage " + cmd[1] + " " + myState.currentPage);
                break;

            case "pointerPosition":
                drawPointer(parseFloat(cmd[1]), parseFloat(cmd[2]))
                break;

            default:
                console.log('RECV msg ' + data)
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

    let dataString = JSON.stringify('changePage,' + myState.currentPage)
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

    let dataString = JSON.stringify('changePage,' + myState.currentPage)
    console.log("SEND: " + dataString)

    sendDataToOthers(dataString)
}

function sendDataToOthers(dataString){
    socket.emit('datachannel', roomName, dataString)
}

function sendDataToServer(dataString){
    socket.emit('signalchannel', roomName, dataString)
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

