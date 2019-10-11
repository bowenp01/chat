function divEscapedContentElement(message){
    return $('<div></div>').text(message);
}

function divSystemContentElement(message){
    return $('<div></div>'.html('<i>'+message+'<i/>'));
}

function processUserInput(chatApp, socket){
    var message = $('#send-message').val();
    var systemMessage;
    // Process commands such as join room etc.
    if(message.charAt(0) == '/'){
        systemMessage = chatApp.processCommand(message);
        if(systemMessage){
            $('#messages').append(systemMessage);
        }
    // Process personal messages
    } else if(message.charAt(0) == '@') {
        systemMessage = chatApp.processPM(message);
        if(systemMessage){
            $('#messages').append(systemMessage);
        }
    // Process general messages    
    } else {
        chatApp.sendMessage($('#room').text(), message);
        //$('#messages').append(divEscapedContentElement(message));
        $('#messages').append(generateAltSpeechBubble(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}


// Message from another user
function generateSpeechBubble(message){
    var usr = message.user;
    if(message.private == true){
        usr = usr +' (Private Msg)';
    }
    var speechBubble =  '<div class="bubble">'+
                        '<div class="txt">'+
                        '  <p class="name">'+usr+'</p>'+
                        '  <p class="message">'+message.text+'</p>'+
                        '  <span class="timestamp">'+message.time+'</span>'+
                        '</div>'+
                        '<div class="bubble-arrow"></div>'+
                        '</div>';
    return speechBubble;
}

// My own messages
function generateAltSpeechBubble(message){    
    var speechBubble ='<div class="bubble-alt">'+
                      '  <div class="txt">'+
                      '    <p class="message">'+message+'</p>'+
                      '    <span class="timestamp">'+timenow()+'</span>'+
                      '  </div>'+
                      '  <div class="bubble-arrow"></div>'+
                      '</div>';
    return speechBubble;
}

// My own messages
function generatePrivateSpeechBubble(message, user){    
    var speechBubble ='<div class="bubble-alt">'+
                      '  <div class="txt">'+
                      '  <p class="name">Private msg to '+user+'</p>'+
                      '    <p class="message">'+message+'</p>'+
                      '    <span class="timestamp">'+timenow()+'</span>'+
                      '  </div>'+
                      '  <div class="bubble-arrow"></div>'+
                      '</div>';
    return speechBubble;
}

// Messages from the administrator
function generateAdminSpeechBubble(message){
    var speechBubble ='<div class="admin">'+
                      '  <div class="txt">'+
                      '    <p class="message">'+message.text+'</p>'+
                      '    <span class="timestamp">'+message.time+'</span>'+
                      '  </div>'+
                      '</div>';
    return speechBubble;                      
}

function showSnackbar(message) {
    $('#snackbar').text(message);
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");
  
    // Add the "show" class to DIV
    x.className = "show";
  
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
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

var socket = io.connect();
$(document).ready(function(){
    var chatApp = new Chat(socket);

    document.getElementById("defaultOpen").click();
    
    socket.on('joined-room', function(message){
        var currentRoomStr = 'CAV Chat - '+message.room;
       $('#current-room').text(currentRoomStr);
       showSnackbar('You have joined '+message.room);
    });
    
    socket.on('message', function(message){
        var newElement = generateSpeechBubble(message);
        $('#messages').append(newElement);
    });

    socket.on('snackbar', function(message){
        showSnackbar(message.text);
    });    

    $('#send-message').focus();

    $('#send-form').submit(function(){
        processUserInput(chatApp, socket);
        return false;
    });

});