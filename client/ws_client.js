// require("tone");

window.onload = function() {
    // var ws = new WebSocket("ws://localhost:1234");
    var ws = new WebSocket(location.origin.replace(/^http/, "ws"));
    var numSamples = 6;
    var areSamplesLoaded = false;
    var sampleIdx = -1;
    var samplePlayer;
    var currSongName = "sdpl"; // fka sampleMode
    var btn0 = document.getElementById("btn0");
    var shouldQuantize = false;
    var songIdx = 0;
    var songNames = ["sdpl", "sbpl", "ns", "begood", "alma", "bachrooma", "bachroomb"];
    var currTriggerTimeout = -1;


    numSamples = 21;
    currSongName = "short_sample_1_";
    songNames = ["short_sample_2_00-", "short_sample_1_"];

    ws.onopen = function() {
        console.log("ws connected");

        ws.send(JSON.stringify({"connect": "client"}));
        ws.send(JSON.stringify({"currSongName": currSongName}));
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
                // "sdpl": sampleBasePath + "saron_sdpl" + sampleIdx + sampleExt,
                // "sbpl": sampleBasePath + "saron_sbpl" + sampleIdx + sampleExt,
                // "begood": sampleBasePath + "begood" + sampleIdx + sampleExt,
                // "alma": sampleBasePath + "alma" + sampleIdx + sampleExt,
                // "ns": sampleBasePath + "ns" + sampleIdx + sampleExt,
                // "bachrooma": sampleBasePath + "bachrooma" + sampleIdx + sampleExt,
                // "bachroomb": sampleBasePath + "bachroomb" + sampleIdx + sampleExt
                "short_sample_2_00-": sampleBasePath + "short_sample_2_00-" + sampleIdx + sampleExt,
                "short_sample_1_": sampleBasePath + "short_sample_1_" + sampleIdx + sampleExt
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
                samplePlayer.get(currSongName).restart(t);

                // Flip sample mode
                // if (currSongName == "sbpl") {
                //     currSongName = "sdpl";
                // }
                // else if (currSongName == "sdpl") {
                //     currSongName = "sbpl";
                // }

                // Visuals
                clearTimeout(currTriggerTimeout);
                document.getElementById("greeting").style.backgroundColor = "purple";
                currTriggerTimeout = setTimeout(function() {
                    document.getElementById("greeting").style.backgroundColor = "white";
                }, 100);
            }
        }

        // Go to song
        if ("goToSong" in data) {
            console.log(data);
            if (data["goToSong"] == "prev") {
                songIdx = (songIdx - 1) % songNames.length;
                if (songIdx < 0) {
                    songIdx = songNames.length - 1;
                }
            }
            else if (data["goToSong"] == "next") {
                songIdx = (songIdx + 1) % songNames.length;
            }
            currSongName = songNames[songIdx];
            ws.send(JSON.stringify({"currSongName": currSongName}));
        }
    }


    // Stayin' alive
    window.setInterval(function() {
        ws.send(JSON.stringify({"ping": "Stayin' alive"}));
    }, 30000);

    var activateSound = function() {
        if (areSamplesLoaded) {
            console.log("act");
            samplePlayer.get(currSongName).start();
            samplePlayer.get(currSongName).stop();

            btn0.innerHTML = "<br/>sound activated :)<br/><br/>"
        }
    };


    btn0.addEventListener("touchend", activateSound);
    btn0.addEventListener("mouseup", activateSound);

};