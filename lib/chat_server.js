var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = [];
var namesUsed = [];
var currentRooms = {};

exports.listen = function(server){
    // Bind socket.io to the http server
    io = socketio.listen(server);
    // When a socket connects
    io.on('connection', function(socket){
        // Assign a name to the user
        guestNumber = assignGuestName(socket, guestNumber);

        // Join 'Lobby' by default
        joinRoom(socket, 'Lobby');

        // Handle any broadcasting of messages
        handleMessageBroadcasting(socket);

        // Handle the user joining another room
        handleRoomJoining(socket);

        // Handle any disconnections
        handleDisconnect(socket);

        // Handle @PM's
        handlePersonalMessage(socket);
    });
};

function assignGuestName(socket, guestNumber){
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    namesUsed.push(name);
    return guestNumber+1;
}

function joinRoom(socket, room){
    // Subscribe the socket to the room supplied as a parameter
    socket.join(room);
     // Maintain a list of which socket is in which room
    currentRooms[socket.id] = room;
    //
    socket.emit('joined-room', {room: room});
    // Let the users in the new room know that someone has joined the room
    socket.broadcast.to(room).emit('snackbar', {text: nickNames[socket.id]+' has joined '+room+'.', 
                                             time: timenow()});
}

function handleMessageBroadcasting(socket){
    socket.on('message', function(message){
        console.log('Msg:'+message.text);
        socket.to(currentRooms[socket.id]).emit('message', {text: message.text, 
                                                            user: nickNames[socket.id], 
                                                            time: timenow(),
                                                            private: false});
    });
}

function handleDisconnect(socket){ 
    socket.on('disconnect', function(){
        console.log('Disconnect:'+ nickNames[socket.id]);
        socket.broadcast.to(currentRooms[socket.id]).emit('snackbar', {text: nickNames[socket.id]+' has disconnected', 
                                                                    time: timenow()});
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[nameIndex];          
    });
}

function handleRoomJoining(socket){
    socket.on('join', function(room){
        console.log('Join:'+ nickNames[socket.id]+ ' '+room.newRoom);
        // Let the users in the current room know that someone has left the room
        socket.broadcast.to(currentRooms[socket.id]).emit('snackbar', {text: nickNames[socket.id]+' has left '+currentRooms[socket.id]+'.', 
                                                                    time: timenow()});
        socket.leave(currentRooms[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}

function handlePersonalMessage(socket){
    socket.on('personalMessage', function(message){
        var targetSocketId = getKeyByValue(nickNames, message.target);
        console.log('@PM:'+message.target+' '+targetSocketId+' '+message.text);
        //todo .. get target
        io.to(targetSocketId).emit('message', {text: message.text, 
                                                user: nickNames[socket.id], 
                                                time: timenow(),
                                                private: true});
    });
}

function timenow(){
    var now= new Date(); 
    ampm= 'AM'; 
    h= now.getHours();
    m= now.getMinutes();
    if(h>= 12){
        if(h>12) h -= 12;
        ampm= 'PM';
    }
    if(m<10) m= '0'+m;
    return h + ':' + m  + ' ' + ampm;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => (object[key]).toLowerCase() === (value).toLowerCase());
  }




