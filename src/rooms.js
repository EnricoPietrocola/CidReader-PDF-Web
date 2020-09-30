//////////////////////////////////////////////////////////////////////////////////////////
//Rooms data structure - SERVER

fs = require('fs')
const rimraf = require('rimraf')

function Room(name, docURL){
    this.name = name;
    this.docURL = docURL;
    this.roomPath = '';
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

            const index = rooms.indexOf(room)

            rooms.splice(index, 1)

            if(room.roomPath !== '' && room.roomPath !== undefined && room.roomPath !== null) {

                console.log('Room is empty. Deleting all files ' + room.roomPath)
                //fs.unlinkSync(room.docURL)

                // delete directory recursively
                /*fs.rmdir(room.roomPath, { recursive: true }, function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log(`Deleted!`);
                });*/
                rimraf(room.roomPath, function () { console.log("Done deleting"); });

            }
            else{
                console.log('No file attached, nothing to delete')
            }
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

function setRoomPath(name, path){
    if (rooms.some(e => e.name === name)) {
        console.log('Room found, updating room path')
        rooms.find(element => element.name === name).roomPath = path;
    }
    else{
        console.log('Could not find a room with name ' + name)
    }
}

function getConnectionsCount(){
    let count = 0;
    rooms.forEach((item) => {
        count += item.connections
    })
    return count
}


module.exports.addRoom = addRoom
module.exports.getRoomURL = getRoomURL
module.exports.changeRoomDocURL = changeRoomDocURL
module.exports.decrementRoomConnection = decrementRoomConnection
module.exports.findRoomByName = findRoomByName
module.exports.setRoomPath = setRoomPath
module.exports.getConnectionsCount = getConnectionsCount
module.exports.rooms = rooms;