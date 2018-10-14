// require("tone");

window.onload = function() {
    // var ws = new WebSocket("ws://localhost:1234");
    var ws = new WebSocket(location.origin.replace(/^http/, "ws"));
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
                // Quantize
                var t = new Tone.Time(Tone.now()).quantize("8n");
                
                // Play sample
                samplePlayer.get(sampleMode).restart(t);

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


    // Stayin' alive
    window.setInterval(function() {
        ws.send(JSON.stringify({"ping": "Stayin' alive"}));
    }, 30000);


    document.getElementById("btn0").addEventListener("touchend", function() {
        if (areSamplesLoaded) {
            console.log("act");
            samplePlayer.get(sampleMode).start();
            samplePlayer.get(sampleMode).stop();
        }
    });

};