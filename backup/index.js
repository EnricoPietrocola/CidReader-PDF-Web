//npm run signalhub
//npm start

//navigator.mediaDevices.getUserMedia({ video: false, audio: false }).then(function (stream) {
    const signalhub = require('signalhub')
    const createSwarm = require('webrtc-swarm')
    const hub = signalhub('CidReader', [
        'http://localhost:8080'
    ])

    console.log('app is running')

    hub.subscribe('CidReader')
        .on('data', function (message) {
            console.log('new message received', message)
        })

    hub.broadcast('CidReader', {hello: 'world'})

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

                var cmd = data.split(",");
                console.log(cmd[0])

                /*switch (cmd[0]) {
                    case "changeDocument":
                        myState.pdf = cmd[1];
                        startDoc();
                        console.log("Visualizing new document");
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
                }*/

            })

        }
    })
    setTimeout(() => swarm.peers.forEach(function (peer) {
        console.log("saying hi")
        peer.send(JSON.stringify("hi"))
    }), 15000);

    swarm.on('disconnect', function (peer, id) {
        if (users[id]) {
            users[id].element.parentNode.removeChild(users[id].element)
            delete users[id]
        }
    })


//})


