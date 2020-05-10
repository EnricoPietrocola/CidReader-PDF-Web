navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (stream) {

    const signalhub = require('signalhub')
    const createSwarm = require('webrtc-swarm')
    const hub = signalhub('CidReader', [
        'http://localhost:8080'
    ])
    const swarm = createSwarm(hub, {
        stream: stream
    })

    const User = require('./User.js')
    const you = new User()
    you.addStream(stream)

    const users = {}
    swarm.on('connect', function (peer, id) {
        if (!users[id]) {
            users[id] = new Player()
            peer.on('data', function (data) {
                data = JSON.parse(data.toString())
                users[id].update(data)
            })
            users[id].addStream(peer.stream)
        }
    })

    swarm.on('disconnect', function (peer, id) {
        if (users[id]) {
            users[id].element.parentNode.removeChild(users[id].element)
            delete users[id]
        }
    })

    // hub.subscribe('update').on('data', function (data) {
    //   if (data.color === you.color) return
    //   if (!players[data.color]) {
    //     players[data.color] = new Player(data)
    //   }
    //   players[data.color].update(data)
    //   //console.log(data)
    // })

    setInterval(function () {
        //hub.broadcast('update', window.location.hash)
        you.update()
        //hub.broadcast('update', you)
        //const youString = JSON.stringify(you)
        swarm.peers.forEach(function (peer) {
            peer.send("test")
        })
    }, 100)

    /*document.addEventListener('keypress', function (e) {
        const speed = 16
        switch (e.key) {
            case 'a':
                you.x -= speed
                break
            case 'd':
                you.x += speed
                break
            case 'w':
                you.y -= speed
                break
            case 's':
                you.y += speed
                break
        }
    }, false)
    */
})