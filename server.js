const express = require("express");
const ws = require("ws");

const app = express();
const wss = new ws.Server({"port": 1234});


app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.html");
});

app.get("/ws_client.js", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.js");
});

app.get("/ws_client.css", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.css");
});

app.listen(3000, function() {
    console.log("Listning on port 3000");
});




wss.on("connection", function(ws) {
    console.log("A user connected!");
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