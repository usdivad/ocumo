const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = http.createServer(app); // We create a separate http server to pass into ws so we can listen to both http and ws on same port

// const wss = new WebSocket.Server({"port": 1234});
const wss = new WebSocket.Server({"server": httpServer});


var users = {};
var numUsers = 0;
var performerID;

// Server
httpServer.listen(PORT, function() {
    console.log("Listning on port " + PORT);
});

// Views
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.html");
});

app.get("/performer", function(req, res) {
    res.sendFile(__dirname + "/client/ws_performer.html");
});

// Src
app.get("/ws_client.js", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.js");
});

app.get("/ws_performer.js", function(req, res) {
    res.sendFile(__dirname + "/client/ws_performer.js");
});

app.get("/ws_client_bundle.js", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client_bundle.js");
});

app.get("/ws_performer_bundle.js", function(req, res) {
    res.sendFile(__dirname + "/client/ws_performer_bundle.js");
});

app.get("/ws_client.css", function(req, res) {
    res.sendFile(__dirname + "/client/ws_client.css");
});

// Lib
app.get("/Tone.js", function(req, res) {
    res.sendFile(__dirname + "/lib/Tone.min.js");
});

app.get("/webmidi.js", function(req, res) {
    res.sendFile(__dirname + "/lib/webmidi.min.js");
});


// Media
app.get("/samples/:sampleFormat/:sampleName", function(req, res) {
    console.log(req.params);
    // res.send(req.params);
    res.sendFile(__dirname + "/samples/" + req.params["sampleFormat"] + "/" + req.params["sampleName"]);
});


// WebSockets
// app.listen(3000, function() {
//     console.log("Listning on port 3000");
// });




wss.on("connection", function(ws) {
    // User ID business
    var userID = Date.now();
    console.log("User %s connected!", userID);
    users[userID] = ws;

    // Receive message
    ws.on("message", function(msg) {
        var wsID = userID;
        console.log("Received: %s from %s", msg, wsID);
        var data = JSON.parse(msg);

        // Add user
        if ("connect" in data) {
            var userType = data["connect"];
            if (userType == "client") {
                ws.send(JSON.stringify({"userIdx": numUsers}));
                numUsers++;
            }
            else if (userType == "performer") {
                performerID = wsID;
                console.log("performerID = " + performerID);
            }
        }

        // Broadcast triggerSample event
        if ("triggerSample" in data) {
            wss.clients.forEach(function(client) {
                if (client != ws && client.readyState == WebSocket.OPEN) {
                    client.send(msg);
                }
            })
        }
    });
});


// wss.on("message", function(message) {
//     console.log
// })


// const wss = new ws.Server({port: 8000});

// wss.on("connection", function connection(ws) {
//     console.log("A user connected!");

//     ws.on("message", function incoming(message) {
//         console.log("Received: %s", message);
//     });

//     ws.send("Hello");
// });