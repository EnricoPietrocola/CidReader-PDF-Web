//npm run signalhub
//npm start

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