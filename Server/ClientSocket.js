//client socket class containing the underlying socket + properties
module.exports = function ClientSocket (socket) {
    this.socket = socket;
    this.username = "";
    this.inRoom = "";
};