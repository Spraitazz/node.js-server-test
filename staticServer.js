var express = require("express");
var app = express();
app.use(express.static("Server"));
app.listen(3000);