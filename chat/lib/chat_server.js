var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nicknames = {};
var currentRoom = {};
var nameUsed = [];

exports.listen = function(server){
    io = socketio.listen(server);
    io.set('log level',1);

    io.sockets.on('connection',function(socket){
        guestNumber = assignGuestName(socket,guestNumber,nicknames,nameUsed);

        joinRoom(socket,'Lobby');

        handleMessageBroadcasting(socket,nicknames);
        handleNameChangeAttempts(socket,nicknames,nameUsed);
        handleRoomJoining(socket);

        socket.on('room',function(){
            socket.emit('rooms',io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket,nicknames,nameUsed);
    });
};

function assignGuestName(socket,guestNumber,nicknames,nameUsed){
    var name = 'Guest' + guestNumber;
    nicknames[socket.id] = name;
    socket.emit('nameresult',{
        success:true,
        name:name
    });
    nameUsed.push(name);
    return guestNumber;
}

function joinRoom(socket,room){
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinresult',{'room':room});

    socket.broadcast.to(room).emit('message',{text:nicknames[socket.id] +' has join' + room+'.'});
}