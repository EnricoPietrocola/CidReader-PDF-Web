//////////////////////////////////////////////////////////////////////////////////////////
//Rooms data structure - SERVER

function Room(name, docURL){
    this.name = name;
    this.docURL = docURL;
    this.connections = 0;
}

let rooms = Array();

//this need to replace all of duplicates below
function findRoomByName(name){
    if (rooms.some(e => e.name === name)) {
        return rooms.find(element => element.name === name)
    }
    else return null;
}

function addRoom(name, docURL){
    if (rooms.some(e => e.name === name)) {
        console.log('Item already there')
        const room = findRoomByName(name)
        incrementRoomConnection(room)
        return findRoomByName(name)
    }
    else{
        console.log('Item added')
        const room = new Room(name, docURL)
        rooms.push(room)
        incrementRoomConnection(room)
        return room
    }
}

function incrementRoomConnection(room){
    room.connections++
    console.log('Room ' + room.name + ' has ' + room.connections + ' connected clients')
}

function decrementRoomConnection(room){
    if(room.connections >= 0) {
        room.connections = room.connections - 1
        console.log('Room ' + room.name + ' has ' + room.connections + ' connected clients')
        if(room.connections <= 0) {
            console.log('Room is empty. Deleting attached document')
        }
    }
    else{
       console.log('Something went wrong with the connection tracking for this room ' + room.name)
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
module.exports.decrementRoomConnection = decrementRoomConnection
module.exports.findRoomByName = findRoomByName
module.exports.rooms = rooms;