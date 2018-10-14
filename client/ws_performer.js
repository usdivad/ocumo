// require("tone");
// require("webmidi");

window.onload = function() {
    // var ws = new WebSocket("ws://localhost:1234");
    var ws = new WebSocket(location.origin.replace(/^http/, "ws"));

    var numUsers = 0; // tODO
    var numSamples = 6; // for SPD

    var midiInput;
    var shouldTriggerSamples = true;

    ws.onopen = function() {
        console.log("ws connected");

        ws.send(JSON.stringify({"connect": "performer"}));
    }

    ws.onmessage = function(message) {
        var data = JSON.parse(message.data);
        if ("currSongName" in data) {
            document.getElementById("currSongNameDiv").innerText = data["currSongName"];
        }
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

    // MIDI WOO
    var handleMIDINoteOn = function(e) {
        // console.log(e);
        console.log(e.note.number + "(" + e.note.name + e.note.octave + ")");

        // Hard-coded for SPD setup, MIDI notes 60-68
        if (e.note.number == 60) {
            // Go to prev song
            ws.send(JSON.stringify({"goToSong": "prev"}));
        }
        else if (e.note.number == 61) {
            // // Trigger all samples
            // ws.send(JSON.stringify({"triggerSample": "all"}));

            // Toggle shouldTriggerSamples
            shouldTriggerSamples = !shouldTriggerSamples;
            if (shouldTriggerSamples) {
                document.getElementById("shouldTriggerSamplesDiv").innerText = "shouldTriggerSamples = true";
            }
            else {
                document.getElementById("shouldTriggerSamplesDiv").innerText = "shouldTriggerSamples = false";
            }
        }
        else if (e.note.number == 62) {
            // Go to next song
            ws.send(JSON.stringify({"goToSong": "next"}));
        }
        else if (e.note.number >= 63 && e.note.number <= 68) {
            // Trigger individual sample
            if (shouldTriggerSamples) {
                ws.send(JSON.stringify({"triggerSample": e.note.number - 62})); // To get 1-6
            }
        }
    };

    WebMidi.enable(function (err) {

        if (err) {
            console.log("MIDI ERROR: " + err);
        }
        else {
            console.log("MIDI inputs:");
            console.log(WebMidi.inputs);

            midiInput = WebMidi.getInputByName("USB Midi");

            if (midiInput) {
                midiInput.addListener("noteon", "all", handleMIDINoteOn);
            }
            else {
                alert("MIDI input not found!! Please re-connect your device");
            }
        }

    });


    // Stayin' alive
    window.setInterval(function() {
        ws.send(JSON.stringify({"ping": "Stayin' alive"}));
    }, 30000);

};