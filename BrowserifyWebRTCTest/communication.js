//test code to be bundled by browserify in order to be serviced on client

const createSwarm = require('webrtc-swarm')

const signalhub = require('signalhub')
const hub = signalhub('CidTest', ['https://signalhub-jccqtwhdwc.now.sh']) //this signaling server is for testing, better deploy one yourself for serious applications

console.log('communication is running')

const swarm = createSwarm(hub, {
    wrtc: require('wrtc') // don't need this if used in the browser
})

swarm.on('peer', function (peer, id) {
    console.log('connected to a new peer:', id)
    console.log('total peers:', swarm.peers.length)
})

swarm.on('connect', function (peer, id) {
    //datachannel
    peer.on('data', function (data) {
        data = JSON.parse(data.toString())
        const cmd = data.split(",");
        console.log(cmd[0])
    })
})

swarm.on('disconnect', function (peer, id) {
    console.log('disconnected from a peer:', id)
    console.log('total peers:', swarm.peers.length)
})

setTimeout(() => swarm.peers.forEach(function (peer) {
    console.log("saying hi to the others")
    peer.send(JSON.stringify(JSON.stringify('hi')))
}), 10000);
