const express = require("express");
const ws = require("ws");

const app = express();
const wss = new ws.Server({"port": 1234});


var users = {};
var numUsers = 0;

// Views
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.html");
});

// Src
app.get("/ws_client.js", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.js");
});

app.get("/ws_client.css", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.css");
});

// Lib
app.get("/Tone.js", function(req, res) {
    res.sendFile(__dirname + "/lib/Tone.min.js");
});


// Media
app.get("/samples/:sampleFormat/:sampleName", function(req, res) {
    console.log(req.params);
    // res.send(req.params);
    res.sendFile(__dirname + "/samples/" + req.params["sampleFormat"] + "/" + req.params["sampleName"]);
});


// WebSockets
app.listen(3000, function() {
    console.log("Listning on port 3000");
});




wss.on("connection", function(ws) {
    var userID = Date.now();
    console.log("User %s connected!", userID);

    users[userID] = ws;

    ws.send(JSON.stringify({"userIdx": numUsers}));

    numUsers++

    ws.on("message", function(msg) {
        console.log("Received: %s", msg);
    });
});



// const wss = new ws.Server({port: 8000});

// wss.on("connection", function connection(ws) {
//     console.log("A user connected!");

//     ws.on("message", function incoming(message) {
//         console.log("Received: %s", message);
//     });

//     ws.send("Hello");
// });