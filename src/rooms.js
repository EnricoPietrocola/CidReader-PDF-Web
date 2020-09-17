//////////////////////////////////////////////////////////////////////////////////////////
//Rooms data structure - SERVER

function Room(name, docURL){
    this.name = name;
    this.docURL = docURL;
}

let rooms = Array();

function addRoom(name, docURL){
    if (rooms.some(e => e.name === name)) {
        console.log('Item already there')
    }
    else{
        console.log('Item added')
        rooms.push(new Room(name, docURL))
    }
}

function getRoomURL(name){
    if (rooms.some(e => e.name === name)) {
        console.log('Room found, connecting client')
        return rooms.find(element => element.name === name).docURL
    }
    else{
        console.log('Could not find a room with the name ' + name + ' , creating a new room...')
    }
}

function changeRoomDocURL(name, docURL) {
    if (rooms.some(e => e.name === name)) {
        console.log('Room found, updating doc URL')
        rooms.find(element => element.name === name).docURL = docURL;
    }
    else{
        console.log('Could not find a room with name ' + name)
    }
}

module.exports.addRoom = addRoom
module.exports.getRoomURL = getRoomURL
module.exports.changeRoomDocURL = changeRoomDocURL
module.exports.rooms = rooms;