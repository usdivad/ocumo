window.onload = function() {
    var ws = new WebSocket("ws://localhost:1234");
    var numSamples = 7;
    var areSamplesLoaded = false;
    var sampleIdx = -1;
    var samplePlayer;
    var sampleMode = "sbpl"; // sdpl, sbpl

    ws.onopen = function() {
        console.log("ws connected");

        ws.send(JSON.stringify({"log": "Client connected!"}));
    }

    ws.onmessage = function(message) {
        console.log("Received: %s", message);
        console.log(message);

        var data = JSON.parse(message.data);
        
        // Load samples
        if ("userIdx" in data) {
            sampleIdx = (data["userIdx"] % numSamples) + 1;
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
            if (data["triggerSample"] == sampleIdx || data["triggerSample"] == "all") {
                samplePlayer.get(sampleMode).restart();

                // Flip sample mode
                if (sampleMode == "sbpl") {
                    sampleMode = "sdpl";
                }
                else {
                    sampleMode = "sbpl";
                }
            }
        }
    }
};