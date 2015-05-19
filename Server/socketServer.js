var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port:8000});
console.log("Socket server started on port 8000 \n");
var clientSockets = [];

//client socket class containing the underlying socket + properties
function ClientSocket (socket) {
this.socket = socket;
this.username = "";
};

//socket connecting
wss.on("connection", function connection(ws) {
//a single websocket starts here
var gotName = false;
var thisSocket = thisSocket = new ClientSocket(ws);

ws.on("open", function open() {
//send online list on opening
var response = [];
response.type = "online";
var onlineList = [];
clientSockets.forEach(function(value, index) {
onlineList.push(value);
});
response.body = onlineList;
ws.send(JSON.stringify(response));
clientSockets.push(thisSocket);
});

ws.on("close", function close() {
//remove websocket from sockets
for (var i = 0; i < clientSockets.length; i++) {
if (clientSockets[i].socket == ws) {
clientSockets.splice(i, 1);
}
}
});


//message received
ws.on("message", function incoming(message) {

var response = [];

if (gotName == false) {
//name not chosen
response.type = "username";
var nameTaken = false;
clientSockets.every(function(currentValue, index) {
//loop through sockets to check if name exists
if (currentValue.username == message) {
//name exists, inform client
nameTaken = true;
response.status = "nt";
return false;
}
else {
return true;
}
});
if (nameTaken == false) {
//name doesn't exist, set name as message
thisSocket.username = message;
gotName = true;
response.status = "nc";
response.username = message;
}
ws.send(JSON.stringify(response));
}

// name chosen
else {





}



});

//single websocket ends here
});

