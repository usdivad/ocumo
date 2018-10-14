// require("tone");
// require("webmidi");

var users = {};
var font;
var fontSize;
var defaultDiameter = 100;

function setup() {
    createCanvas(800, 600);

    // for (var i=0; i<5; i++) {
    //     addRandomUser();
    //     console.log(i);
    // }

    textAlign(CENTER);

    font = 

    document.getElementById("addRandomUserBtn").addEventListener("click", function(e) {
        addRandomUser();
    });
}

function draw() {
    background("gray");
    noStroke();
    // ellipse(50, 50, 80, 80);

    for (var id in users) {
        var user = users[id];

        // Display the user
        user.show();
    }
}

function User(id, x, y, color) {
    this.id = id;
    this.diameter = defaultDiameter;
    this.x = x;
    this.y = y;
    this.color = color;
    this.show = function() {
        var diameter = this.diameter;
        var radius = diameter / 2;
        var isMouseover = false

        // Hover
        if ( (mouseX < this.x + radius && mouseX > this.x - radius) &&
            (mouseY < this.y + radius && mouseY > this.y - radius) ) {
            // console.log("mouse is within");
            diameter = this.diameter * 1.5;
            isMouseover = true;
        }

        // if (this.x + mouseX > this.x + this.diameter/2) {
        //     console.log("mouse is within");
        //     diameter = this.diameter * 1.5;
        // }
        else {

        }

        fill(this.color[0], this.color[1], this.color[2]);
        ellipse(this.x, this.y, diameter, diameter);
        fill(255,255,255);
        text(this.id, this.x, this.y);

        if (isMouseover) {
            // Show options
            var btnWidth = 10;
            var btnHeight = 7;

            // Load btn
            fill(0, 0, 0);
            if (mouseX < this.x + btnWidth && mouseX > this.x - btnWidth &&
                mouseY < this.y - (radius*2/3) + btnHeight && mouseY < this.y + (radius*2/3) - btnHeight) {
                fill(255-this.color[0], 255-this.color[1], 255-this.color[2]);
            }
            text("load", this.x, this.y - radius*2/3);

            // Play btn
            fill(0, 0, 0);
            if (mouseX < this.x - (radius*2/3) + btnWidth && mouseX > this.x - (radius*2/3) - btnWidth &&
                mouseY < this.y + (radius*2/3) + btnHeight && mouseY < this.y + (radius*2/3) - btnHeight) {
                fill(255-this.color[0], 255-this.color[1], 255-this.color[2]);
            }
            text("play", this.x - radius*2/3, this.y + radius*2/3);

            // Stop btn
            fill(0, 0, 0);
            if (mouseX < this.x + (radius*2/3) + btnWidth && mouseX > this.x + (radius*2/3) - btnWidth &&
                mouseY < this.y + (radius*2/3) + btnHeight && mouseY < this.y + (radius*2/3) - btnHeight) {
                fill(255-this.color[0], 255-this.color[1], 255-this.color[2]);
            }
            text("stop", this.x + radius*2/3, this.y + radius*2/3);
        }
    }

    this.handleClick = function() {
        console.log("click");
    }
}

function addUser(id, x, y, color) {
    var user = new User(id, x, y, color);
    users[id] = user;
}

function addRandomUser() {
    addUser(Date.now(), random(width-defaultDiameter), random(height-defaultDiameter), [random(255), random(255), random(255)]);
}


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

    // Load
    document.getElementById("loadSampleBtn").addEventListener("click", function() {
        var userID = document.getElementById("loadSampleUserID").value;
        var samplePath = document.getElementById("loadSamplePath").value;
        var sampleName = document.getElementById("loadSampleName").value;

        ws.send(JSON.stringify({
            "loadSample": {
                "userID": userID,
                "samplePath": samplePath,
                "sampleName": sampleName
            }
        }));
    });

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
                console.log("MIDI input not found!! Please re-connect your device");
            }
        }

    });


    // Stayin' alive
    window.setInterval(function() {
        ws.send(JSON.stringify({"ping": "Stayin' alive"}));
    }, 30000);

};