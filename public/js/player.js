const socket = io()
const roomName = 'player'
socket.emit('join', roomName)

const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();
const playButton = document.getElementById("play-button");

playButton.addEventListener('click', () => {
    Tone.loaded().then(() => {
        player.start();
        sendDataToOthers(JSON.stringify('play,0'))
    });
});

function sendDataToOthers(dataString) {
    socket.emit('datachannel', roomName, dataString)
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

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
            case "play":
                //myState.currentPage = parseInt(cmd[1]);
                console.log('Remote Play Pressed')
                player.start();
                break;

            default:
                console.log('RECV msg ' + data)
        }
    }
})