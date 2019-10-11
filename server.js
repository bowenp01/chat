// Include our modules
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//------------------------------------------------------------------------------------------------------
// Helper functions
//------------------------------------------------------------------------------------------------------

// Handle 404 errors when file requested does not exist
function send404(response){
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('Error 404: resource not found');
    response.end();
}

// Serves file data. Writes the apporpriate HTTP headers and sends contents of file
function sendFile(response, filePath, fileContents){
    response.writeHead(200, {"Content-Type": mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

// Unless it is the first time a file is accessed the file will be served from memory as its fast.
// This method determines whether a file has been cached and if so serves it. if not it's read from
// disc, cached and then served
function serveStatic(response, cache, absPath){
    if(cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists){
            if(exists) {
                fs.readFile(absPath, function(err, data){
                    if(err){
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            }else{
                send404(response);
            }
        });
    }
}

//------------------------------------------------------------------------------------------------------
// Create the HTTP Server and set it to listen on port 3000
//------------------------------------------------------------------------------------------------------

var server = http.createServer(function(request, response){
    var filePath = false;
    if(request.url=='/'){ 
        filePath = 'public/index.html';
    }else{
        filePath = 'public' + request.url;
    }
    var absPath = './' +filePath;
    serveStatic(response, cache, absPath);
});


server.listen(3000, function(){
    console.log('Chat server listening on port 3000.');

//------------------------------------------------------------------------------------------------------
// Create the Socket.IO Server and set it to listen on port 3000
//------------------------------------------------------------------------------------------------------

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

});

