window.onload = function() {
    var ws = new WebSocket("ws://localhost:1234");
    var numSamples = 7;
    var areSamplesLoaded = false;
    var samplePlayer;

    ws.onopen = function() {
        console.log("ws connected");

        ws.send("Connected!");
    }

    ws.onmessage = function(message) {
        console.log("Received: %s", message);
        console.log(message);

        var data = JSON.parse(message.data);
        
        // Load samples
        if ("userIdx" in data) {
            var sampleIdx = (data["userIdx"] % numSamples) + 1;
            // var sampleName = "sbpl" + (sampleIdx+1);
            var sampleBasePath = "samples/mp3/";
            var sampleExt = ".mp3";
            samplePlayer = new Tone.Players({
                "sdpl": sampleBasePath + "saron_sdpl" + sampleIdx + sampleExt,
                "sbpl": sampleBasePath + "saron_sbpl" + sampleIdx + sampleExt
            }, function() {
                console.log("Done loading samples!");
                areSamplesLoaded = true;
            }).toMaster();
        }

        // Playback
        if ("triggerSample" in data && areSamplesLoaded) {
            samplePlayer.get(data["triggerSample"]).restart();
        }
    }
};