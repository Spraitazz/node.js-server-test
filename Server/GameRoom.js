//room class for game rooms
module.exports = function GameRoom (roomName, roomOwner, roomType, roomPass) {
    this.roomName = roomName;
    this.roomType = roomType;
    this.roomPass = roomPass;
    this.roomOwner = roomOwner;
    if (roomPass.length>0){
        this.hasPass = true;
    } else {
        this.hasPass = false;
    }
    this.players = [];
    this.players.push(roomOwner);
}