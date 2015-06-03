//client socket class containing the underlying socket + properties
//only exists temporarily as socket is reset on refresh
module.exports = function ClientSocket (socket) {
    this.socket = socket;
    this.username = "";
    this.inRoom = "";
};