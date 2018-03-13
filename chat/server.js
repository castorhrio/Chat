var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

var server = http.createServer(function(request,response){
    var filepath = '';
    if(request.url == '/'){
        filepath = 'public/index.html';
    }else{
        filepath = "public" + request.url;
    }

    var abspath = './' + filepath;
    serverStatic(response,cache,abspath);
});

function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('Ooooooooops, the page not found');
    response.end();
}

function sendFile(response,filepath,content){
    response.writeHead(200,{'Content-Type':mime.lookup(path.basename(filepath))});
    response.end(content);
}

function serverStatic(response,cache,path){
    if(cache[path]){
        sendFile(response,path,cache[path]);
    }
    else{
        fs.exists(path,function(exists){
            if(exists){
                fs.readFile(path,function(err,data){
                    if(err){
                        send404(response);
                    }else{
                        cache[path] = data;
                        sendFile(response,path,data);
                    }
                });
            }else{
                send404(response);
            }
        });
    }
}

server.listen(3000,function(){
    console.log("server listening on port 3000");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);