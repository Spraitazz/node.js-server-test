(function() {

"use strict";

var express = require("express");
var https = require("https");
var http = require("http");
var WebSocketServer = require("ws").Server;
var morgan = require("morgan");
var fs = require("fs");

var app = express();

var accessLogStream = fs.createWriteStream("logs/access.log",{flags: "a"});
app.use(express.static("Client"));

app.use(morgan("combined", {stream: accessLogStream}));

var httpPort = 80;
var httpsPort = 443;
var options = {
key: fs.readFileSync("ssl/key.pem"),
cert: fs.readFileSync("ssl/cert.pem")
};

var server = http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(httpPort);
var secureServer = https.createServer(options, app).listen(httpsPort);
console.log("Static web server started successfully on ports " + httpPort + " and " + httpsPort);

var wss = new WebSocketServer({server: secureServer});
console.log("Socket server started on port 8000 \n");
var clientSockets = [];
var gameRooms = [];

//client socket class containing the underlying socket + properties
function ClientSocket (socket) {
this.socket = socket;
this.username = "";
};

//room class for game rooms
function GameRoom (roomName, roomOwner) {
this.roomName = roomName;
this.roomOwner = roomOwner;
this.players = [];
}

function broadcast (msg) {
wss.clients.forEach(function (client) {
 client.send(msg);    
  });
}

//socket connecting
wss.on("connection", function connection(ws) {
//a single websocket starts here
  var thisSocket = new ClientSocket(ws);

  ws.on("open", function open() {
  //socket doesnt exist until it has a name
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
  if (typeof thisSocket.username != "undefined") {
  var message = {};
  message.type = "disconnected";
  message.username = thisSocket.username;
  broadcast(JSON.stringify(message));
  }
  });


  //message received
  ws.on("message", function incoming(message) {

  var response = {};
  var msg = JSON.parse(message);
  switch (msg.type) {

  case "setUsername":
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
  }
  else {
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
  }
  break;

  case "hasUsername":
  thisSocket.username = msg.username;
  clientSockets.push(thisSocket);
  break;

}
  //broadcast new connection to others
  var newConnection = {};
  newConnection.type = "connected";
  newConnection.username = msg.username;
  clientSockets.forEach(function(value, index) {
  if (value.username !== msg.username) {
  value.socket.send(JSON.stringify(newConnection));
  }
  });

  //send online list to new user
  var online = {};
  online.type = "online";
  var onlineList = [];
  clientSockets.forEach(function(value, index) {
  onlineList.push(value.username);
  });
  online.body = onlineList;
  ws.send(JSON.stringify(online));

  //send game room list to new user 
  var gameRoomList = {};
  gameRoomList.type = "gamerooms";
  var roomNames = [];
  gameRooms.forEach(function(value, index) {
  roomNames.push(value.roomName);
  });
  gameRoomList.roomNames = roomNames;
  ws.send(JSON.stringify(gameRoomList));



  });

//single websocket ends here
});

}());





