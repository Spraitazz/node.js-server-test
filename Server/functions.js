
//broadcast message to all clients
exports.getFunctions = function(wss, clientSockets, gameRooms){
    return {

        broadcast: function(msg) {
            wss.clients.forEach(function (client) {
                client.send(msg);    
            });
        },
        
        broadcastNewClient: function(msg) {
              //broadcast new connection to others
              var newConnection = {};
              newConnection.type = "connected";
              newConnection.username = msg.username;
              clientSockets.forEach(function(value, index) {
                  if (value.username !== msg.username) {
                      value.socket.send(JSON.stringify(newConnection));
                  }
              });
          
          },
          
        dataOnJoin: function(ws) {          
              //send online list to new user
              var online = {};
              online.type = "online";
              var onlineList = [];
              clientSockets.forEach(function(value, index) {
                  onlineList.push(value.username);
              });
              online.body = onlineList;
              ws.send(JSON.stringify(online));
              
              //check if user is in game room, if true:
              //send game room info to user 

              //send game room list to new user 
              var gameRoomList = {};
              gameRoomList.type = "gamerooms";
              var rooms = [];
              gameRooms.forEach(function(value, index) {
                  var room = {};
                  room.roomName = value.roomName;
                  room.roomType = value.roomType;
                  room.hasPass = value.hasPass;
                  rooms.push(room);
              });
              gameRoomList.rooms = rooms;
              ws.send(JSON.stringify(gameRoomList));              
          }
          
      };
};