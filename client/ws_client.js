// require("tone");

window.onload = function() {
    // var ws = new WebSocket("ws://localhost:1234");
    var ws = new WebSocket(location.origin.replace(/^http/, "ws"));
    var numSamples = 7;
    var areSamplesLoaded = false;
    var sampleIdx = -1;
    var samplePlayer;
    var sampleMode = "sbpl"; // sdpl, sbpl
    var btn0 = document.getElementById("btn0");
    var shouldQuantize = false;

    ws.onopen = function() {
        console.log("ws connected");

        ws.send(JSON.stringify({"connect": "client"}));
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

                btn0.innerHTML = "<br/>done loading samples! touch me to activate sound<br/><br/>"
            }).toMaster();
        }

        // Playback
        if ("triggerSample" in data && areSamplesLoaded) {
            if (data["triggerSample"] == sampleIdx || data["triggerSample"] == "all") {
                // Quantize
                var t = new Tone.Time(Tone.now());
                if (shouldQuantize) {
                    t = t.quantize("16n");
                }
                
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

    var activateSound = function() {
        if (areSamplesLoaded) {
            console.log("act");
            samplePlayer.get(sampleMode).start();
            samplePlayer.get(sampleMode).stop();

            btn0.innerHTML = "<br/>sound activated :)<br/><br/>"
        }
    };


    btn0.addEventListener("touchend", activateSound);
    btn0.addEventListener("mouseup", activateSound);

};