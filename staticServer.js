var express = require("express");
var readline = require("readline");
var app = express();
app.use(express.static("Server"));
var port;
var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt("specify a port \n");
rl.prompt();
rl.on("line", function(line) {
if (!isNaN(line)) {
if (line > 0 && line < 65000) {
port = line;
app.listen(port);
console.log("Server started successfully on port " + port);
rl.close();
}
else {
console.log("ERROR. incorrect value for port (0 to 65000 only)");
}
}
else {
console.log("ERROR. enter integer value");
}

});


