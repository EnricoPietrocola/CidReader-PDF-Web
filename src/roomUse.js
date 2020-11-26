rooms = require('../src/rooms.js')

//test
rooms.addRoom('picci', 'poppo')
rooms.addRoom('pucci', 'pu')
rooms.addRoom('picci', 'poppo')


console.log(rooms.rooms)
console.log(rooms.getRoomURL('picci'))

rooms.changeRoomDocURL('picci', 'puppu')

console.log(rooms.getRoomURL('picci'))