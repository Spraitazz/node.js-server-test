var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port:8080});
console.log("Socket server started on port 8080 \n");
var sockets = [];

wss.on("connection", function connection(ws) {
//a single websocket starts here
sockets.push(ws);

ws.on("open", function open() {
ws.send("Welcome from server!");
});

ws.on("close", function close() {
for (var i = 0; i < sockets.length; i++) {
if (sockets[i] == ws) {
sockets.splice(i, 1);
}
}
});

ws.on("message", function incoming(message) {
ws.send(message + " resent by Server");
});

//single websocket ends here
});

