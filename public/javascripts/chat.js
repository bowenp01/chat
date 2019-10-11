var Chat = function(socket){
    this.socket = socket;
}

Chat.prototype.sendMessage = function(room, text){
    //alert('sendMessage: '+text);
    var message = {
        room : room,
        text : text
    };
    this.socket.emit('message', message);
}

Chat.prototype.changeRoom = function(room){
    //alert('changeRoom: '+room);
    this.socket.emit('join', {newRoom: room} );
}

Chat.prototype.processCommand = function(command){
    var words = command.split(' ');
    var command = words[0]
                    .substring(1, words[0].length)
                    .toLowerCase();
    var message = false;
    switch(command){
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var room = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'Unrecognised command';
    }
    if(message){
        return generateAdminSpeechBubble({text: message, time: timenow()});
    }else{
        return message;
    }
}

Chat.prototype.processPM = function(command){
    var words = command.split(' ');
    var targetUser = words[0]
                    .substring(1, words[0].length);

    words.shift();
    var personalMessage = words.join(' ');
    this.socket.emit('personalMessage', {target: targetUser, text:personalMessage});
    return generatePrivateSpeechBubble(personalMessage, targetUser);
}

function openPage(evt, pageName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(pageName).style.display = "block";
    evt.currentTarget.className += " active";
  }