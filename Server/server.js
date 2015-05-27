(function() {
//strict mode 
"use strict";

var express = require("express");
var https = require("https");
var http = require("http");
var WebSocketServer = require("ws").Server;
var morgan = require("morgan");
var fs = require("fs");
var ClientSocket = require("./ClientSocket.js");
var GameRoom = require("./GameRoom.js");
//use express.js
var app = express();
//access logging using morgan
var accessLogStream = fs.createWriteStream("logs/access.log",{flags: "a"});
app.use(express.static("Client"));
app.use(morgan("combined", {stream: accessLogStream}));
//set server options
var httpPort = 80;
var httpsPort = 443;
var options = {
    key: fs.readFileSync("ssl/key.pem"),
    cert: fs.readFileSync("ssl/cert.pem")
};

//start http, https and wss servers

var server = http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(httpPort);

var secureServer = https.createServer(options, app).listen(httpsPort);
console.log("Static web server started successfully on ports " + httpPort + " and " + httpsPort);

var wss = new WebSocketServer({server: secureServer});
console.log("Socket server started on port 8000 \n");

//BEGIN FUNCTIONALITY ---------------------------------------------------------------------

var clientSockets = [];
var gameRooms = [];
//get all functions from outside file
var functions = require("./functions.js").getFunctions(wss, clientSockets, gameRooms);
var broadcast = functions.broadcast;
var broadcastNewClient = functions.broadcastNewClient;
var dataOnJoin = functions.dataOnJoin;

//socket connecting
wss.on("connection", function connection(ws) {

    //a single websocket starts here
    var thisSocket = new ClientSocket(ws);

    ws.on("open", function open() {
        //socket doesnt exist (for other players) until it has a name
    });

    ws.on("close", function close() {
        //remove websocket from sockets
        for (var i = 0; i < clientSockets.length; i++) {
            if (clientSockets[i].socket === ws) {
                clientSockets.splice(i, 1);
                break;
            }
        }
        //only inform if disconnected user had username
        if (thisSocket.username.length > 0) {
            var message = {};
            message.type = "disconnected";
            message.username = thisSocket.username;
            broadcast(JSON.stringify(message));
        }
    });


    //message received
    ws.on("message", function incoming(message) {

        var msg = JSON.parse(message.replace(/[\/\\<>=]/g, ""));

        //check type of message, create appropriate response
        switch (msg.type) {

        case "setUsername":
            var response = {};
            //username not yet set
            response.type = "username";
            var nameTaken = false;
            clientSockets.every(function(currentValue, index) {
                //loop through sockets to check if name exists
                if (currentValue.username === msg.username) {
                    //name exists, inform client
                    nameTaken = true;
                    response.status = "nt";
                    ws.send(JSON.stringify(response));
                    return false;
                } else {
                    return true;
                }
            });
            if (nameTaken === false) {
                //name doesn't exist, set name as message and SEND
                thisSocket.username = msg.username;
                clientSockets.push(thisSocket);
                response.status = "nc";
                response.username = msg.username;  
                ws.send(JSON.stringify(response));
                //inform others of new player, send all data to this client
                broadcastNewClient(msg);
                dataOnJoin(thisSocket.socket);  
            }
        break;
        
        

        case "hasUsername":
            thisSocket.username = msg.username;
            clientSockets.push(thisSocket);
            //inform others of new player, send all data to this client
            broadcastNewClient(msg);
            dataOnJoin(thisSocket.socket);
            myRoom.type = "myRoom";
            myRoom.roomName = thisSocket.inRoom;
            ws.send(myRoom);
        break;
        
        
        

        case "createRoom":
            //creating new room, check if name exists
            var nameTaken = false;
            var roomMessage = {};
            roomMessage.type = "roomCreate";
            gameRooms.every(function(currentValue, index) {
                //loop through rooms to check if name exists
                if (currentValue.roomName === msg.roomName) {
                    //room name exists, inform client
                    nameTaken = true;
                    roomMessage.status = "rnt";
                    ws.send(JSON.stringify(roomMessage));
                    return false;
                } else {
                    return true;
                }
            });
            if (nameTaken === false){
                //room with such a name doesn't exist, add room to array
                var newRoom = new GameRoom(msg.roomName, msg.roomOwner, msg.roomType, msg.roomPass);
                gameRooms.push(newRoom); 
                //inform player of the room being successfully created
                roomMessage.roomInfo = newRoom;
                ws.send(JSON.stringify(roomMessage));
                //set this player's info to being in the room
                clientSockets.every(function(value, index) {
                    if (clientSockets.username == thisSocket.username){
                        clientSockets.inRoom = msg.roomName;
                        return true;
                    } else {
                        return false;
                    }
                });
                //inform all players of new room, don't send password
                var newRoomMessage = {};
                newRoomMessage.type = "newRoom";
                newRoomMessage.roomName = newRoom.roomName;
                newRoomMessage.roomType = newRoom.roomType;
                newRoomMessage.hasPass = newRoom.hasPass;
                broadcast(JSON.stringify(newRoomMessage));                
            }
            
        break;

        case "joinRoom":
        //attempting to join a room


        }

    });

    //single websocket ends here
});

}());






