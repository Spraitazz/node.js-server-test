var express = require("express");
var morgan = require("morgan");
var readline = require("readline");
var fs = require("fs");

var app = express();
var accessLogStream = fs.createWriteStream("logs/access.log",{flags: "a"});
var port = 80;

app.use(express.static("Client"));
app.use(morgan("combined", {stream: accessLogStream}));
app.listen(port);
console.log("Static web server started successfully on port " + port);





