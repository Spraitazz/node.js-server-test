var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port:8000});
console.log("Socket server started on port 8000 \n");
var clientSockets = [];

//client socket class containing the underlying socket + properties
function ClientSocket (socket) {
this.socket = socket;
this.username = "";
};

function broadcast (msg) {
wss.clients.forEach(function (client) {
    client.send(msg);
  });
}

//socket connecting
wss.on("connection", function connection(ws) {
//a single websocket starts here
var gotName = false;
var thisSocket = new ClientSocket(ws);

ws.on("open", function open() {
//socket doesnt exist until it has a name
});

ws.on("close", function close() {
//remove websocket from sockets
for (var i = 0; i < clientSockets.length; i++) {
if (clientSockets[i].socket === ws) {
clientSockets.splice(i, 1);
}
}
});


//message received
ws.on("message", function incoming(message) {

var response = {};

if (gotName === false) {
//name not chosen
response.type = "username";
var nameTaken = false;
clientSockets.every(function(currentValue, index) {
//loop through sockets to check if name exists
if (currentValue.username === message) {
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
thisSocket.username = message;
clientSockets.push(thisSocket);
gotName = true;
response.status = "nc";
response.username = message;
ws.send(JSON.stringify(response));

//broadcast new connection to others
var newConnection = {};
newConnection.type = "connected";
newConnection.username = message;
broadcast(JSON.stringify(newConnection));

//send online list to new user
var online = {};
online.type = "online";
var onlineList = [];
clientSockets.forEach(function(value, index) {
onlineList.push(value.username);
});
online.body = onlineList;
ws.send(JSON.stringify(online));


}
}

// name chosen
else {





}



});

//single websocket ends here
});

