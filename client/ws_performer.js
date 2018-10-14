// require("tone");
// require("webmidi");

window.onload = function() {
    // var ws = new WebSocket("ws://localhost:1234");
    var ws = new WebSocket(location.origin.replace(/^http/, "ws"));

    var numUsers = 0; // tODO
    var numSamples = 8;

    var midiInput;

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

    // MIDI WOO
    var handleMIDINoteOn = function(e) {
        // console.log(e);
        console.log(e.note.number + "(" + e.note.name + e.note.octave + ")");
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
};