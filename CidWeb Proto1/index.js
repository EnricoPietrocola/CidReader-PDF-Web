//npm run signalhub
//npm start


let currentPageIndex = 0;
let pdfInstance = null;
let totalPagesCount = 0;

window.initPDFViewer = function(pdfURL) {
    pdfjsLib.getDocument(pdfURL).then(pdf => {
        pdfInstance = pdf;
        totalPagesCount = pdf.numPages;
        initPager();
        render();
    });
};

function renderPage(page) {
    let pdfViewport = page.getViewport(1);

    const container = viewport.children[0];

    // Render at the page size scale.
    pdfViewport = page.getViewport(container.offsetWidth / pdfViewport.width);
    const canvas = container.children[0];
    const context = canvas.getContext("2d");
    canvas.height = pdfViewport.height;
    canvas.width = pdfViewport.width;

    page.render({
        canvasContext: context,
        viewport: pdfViewport
    });
}

function onPagerButtonsClick(event) {
    const action = event.target.getAttribute("data-pager");
    if (action === "prev") {
        if (currentPageIndex === 0) {
            return;
        }
        currentPageIndex -= pageMode;
        if (currentPageIndex < 0) {
            currentPageIndex = 0;
        }
        render();
    }
    if (action === "next") {
        if (currentPageIndex === totalPagesCount - 1) {
            return;
        }
        currentPageIndex += pageMode;
        if (currentPageIndex > totalPagesCount - 1) {
            currentPageIndex = totalPagesCount - 1;
        }
        render();
    }
}

const viewport = document.querySelector("#viewport");

function render() {
    pdfInstance.getPage(currentPageIndex + 1).then(page => {
        viewport.innerHTML = `<div><canvas></canvas></div>`;
        renderPage(page);
    });
}

//navigator.mediaDevices.getUserMedia({ video: false, audio: false }).then(function (stream) {

    const signalhub = require('signalhub')
    const createSwarm = require('webrtc-swarm')
    const hub = signalhub('CidReader', [
        'http://localhost:8080'
    ])
    const swarm = createSwarm(hub, {
        //stream: stream //
    })

    const User = require('./User.js')
    const you = new User()
    //you.addStream(stream)

    const users = {}
    swarm.on('connect', function (peer, id) {
        if (!users[id]) {
            users[id] = new User()
            peer.on('data', function (data) {
                data = JSON.parse(data.toString())
                users[id].update(data)
                console.log("turnPage " + data)
            })
            //users[id].addStream(peer.stream) //
        }
    })

    swarm.on('disconnect', function (peer, id) {
        if (users[id]) {
            users[id].element.parentNode.removeChild(users[id].element)
            delete users[id]
        }
    })

    setInterval(function () {
        //hub.broadcast('update', window.location.hash)
        you.update()
        //hub.broadcast('update', you)
        //const youString = JSON.stringify(you)
        const youString = JSON.stringify(you.page)
        swarm.peers.forEach(function (peer) {
            peer.send(youString)
        })
    }, 100)

    document.addEventListener('keypress', function (e) {
        switch (e.key) {
            case 'a':
                you.page--
                break
            case 'd':
                you.page++
                break
            case 'w':
                break
            case 's':
                break
        }
    }, false)

//})


