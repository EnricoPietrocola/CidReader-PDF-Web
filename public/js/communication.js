//test code to be bundled by browserify in order to be serviced on client

//when this code is changed: browserify communication.js > bundle.js

//const controls = require('./readerControls.js')

const createSwarm = require('webrtc-swarm')

const signalhub = require('signalhub')
const hub = signalhub('CidReader' + window.location.pathname, ['https://signalhub-jccqtwhdwc.now.sh']) //this signaling server is for testing, better deploy one yourself for serious applications

console.log('communication is running')
console.log('room name = ' + window.location.pathname)

const swarm = createSwarm(hub, {
    wrtc: require('wrtc') // don't need this if used in the browser
})

console.log('peer name = ' + swarm.me)

swarm.on('peer', function (peer, id) {
    console.log('connected to a new peer:', id)
    console.log('total peers:', swarm.peers.length)
})

swarm.on('disconnect', function (peer, id) {
    console.log('disconnected from a peer:', id)
    console.log('total peers:', swarm.peers.length)
    /*if (users[id]) {
        users[id].element.parentNode.removeChild(users[id].element)
        delete users[id]
    }*/
})

/*swarm.peers.forEach(function (peer) {
    console.log("saying hi to the others")
    peer.send(JSON.stringify(JSON.stringify('hi')))
});*/

const user = require('./user.js')
const you = new user()

const users = {}

swarm.on('connect', function (peer, id) {
    //datachannel
    if (!users[id]) {
        users[id] = new user()

        peer.on('data', function (data) {

            data = JSON.parse(data.toString())

            console.log(data)

            const cmd = data.split(",");

            switch (cmd[0]) {
                case "changeDocument":
                    myState.pdf = cmd[1];
                    //startDoc();
                    visualizeDoc(myState.pdf)
                    console.log("Visualizing new document " + myState.pdf);
                    break;

                case "goForward":
                    myState.currentPage = parseInt(cmd[1]);
                    document.getElementById("current_page").value = myState.currentPage;
                    render();
                    console.log("turnPage " + cmd[1] + " " + myState.currentPage);
                    break;

                case "goBackward":
                    myState.currentPage = parseInt(cmd[1]);
                    document.getElementById("current_page").value = myState.currentPage;
                    render();
                    console.log("turnPage " + cmd[1] + " " + myState.currentPage);
                    break;
                }
            }
        )
    }

})

document.getElementById('go_previous')
    .addEventListener('click', (e) => {
        if(myState.pdf == null
            || myState.currentPage == 1)
            return;

        myState.currentPage -= 1;
        document.getElementById("current_page")
            .value = myState.currentPage;
        //console.log("render from visualize doc - go previous")
        render()

        let dataString = JSON.stringify('goBackward,' + myState.currentPage)
        console.log(dataString)

        sendDataToOthers(dataString)
    });

document.getElementById('go_next')
    .addEventListener('click', (e) => {
        if(myState.pdf == null || myState.currentPage >= myState.pdf._pdfInfo.numPages)
            return;

        myState.currentPage += 1;
        document.getElementById("current_page")
            .value = myState.currentPage;
        //console.log("render from visualize doc - go next")
        render()

        let dataString = JSON.stringify('goForward,' + myState.currentPage)
        console.log(dataString)

        sendDataToOthers(dataString)
    });

document.getElementById('changeDocument')
    .addEventListener('click', (e) => {
        let documentLink = document.getElementById("documentLink").value;
        console.log("changing document")
        let dataString = JSON.stringify('changeDocument,' + documentLink)

        sendDataToOthers(dataString)
    });


function sendDataToOthers(dataString){
    swarm.peers.forEach(
        function(peer) {
            peer.send(dataString)
        })
}