window.onload = function() {
    var ws = new WebSocket("ws://localhost:1234");

    ws.onopen = function() {
        console.log("ws connected");

        ws.send("Connected!");
    }

    ws.onmessage = function(e) {
        console.log("Received: %s", e);
    }
};