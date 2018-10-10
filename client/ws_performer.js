window.onload = function() {
    var ws = new WebSocket("ws://localhost:1234");
    var numUsers = 0; // tODO
    var numSamples = 8;

    ws.onopen = function() {
        console.log("ws connected");

        ws.send(JSON.stringify({"log": "Performer connected!"}));
    }

    // Trigger samples

    // "all"
    document.getElementById("btnAll").addEventListener("click", function() {
        ws.send(JSON.stringify({"triggerSample": "all"}));
    });

    // Indexed
    for (let i=1; i<numSamples; i++) {
        document.getElementById("btn" + i).addEventListener("click", function() {
            ws.send(JSON.stringify({"triggerSample": i}));
        });
    }
};