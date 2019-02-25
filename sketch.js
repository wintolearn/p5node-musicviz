

// Keep track of our socket connection
var socket;
var song;
var fft;
var button;
var spectrum;
var stepSize = 5;
var touchStepSize = 2;
var transp = 80;
var ampConst = 0.015;

function preload() {
    song = loadSound('./comprehension.mp3');
}

function toggleSong() {

    if (song.isPlaying()) {
        song.pause();
    } else {
        song.play();
        spectrum = fft.analyze();
    }

}


function setup() {
    button = createButton('/PLAY/');

    col = color(25,23,200,2);
    fontCol = color(255,255,255);

    button.style('font-size', '35px');
    button.style('background-color', col);
    button.style('color', fontCol);


    button.position(10, 10);


    createCanvas(windowWidth*0.9, windowHeight*0.9);
    background(0);
    strokeWeight(40);

    button.mousePressed(toggleSong);

    angleMode(DEGREES);


    fft = new p5.FFT(0.9, 128);

    // Start a socket connection to the server
    // Some day we would run this server somewhere else
    //socket = io.connect('http://localhost:8080');

    socket = io();
    // We make a named event called 'mouse' and write an
    // anonymous callback function
    socket.on('mouse',
        // When we receive data
        function(data) {
            //console.log("Got: " + data.x + " " + data.y);
            // Draw a blue circle
            fill(0,0,255);
            noStroke();

            for (var i = 0; i < spectrum.length; i+=stepSize) {
                var angle = map(i, 0, spectrum.length, 0, 360);
                var amp = Math.pow(spectrum[i],2)*ampConst;
                var r = map(amp, 0, 256, 20, 800);
                var x = data.x+ r * cos(angle);
                var y = data.y+ r * sin(angle);

                stroke(i+random(100), random(data.x*0.5), random(data.y*0.5),transp);
                line(data.x, data.y, x, y);

            }
        }
    );
}

function draw() {
    // Nothing

    //need this for holding mouse on computer to generate clients stuff on clients screen directly

    if(mouseIsPressed === true) {
        fill(255);
        noStroke();
        // Send the mouse coordinates
        sendmouse(mouseX,mouseY);
        spectrum = fft.analyze();
        noStroke();


        for (var i = 0; i < spectrum.length; i+=stepSize) {
            var angle = map(i, 0, spectrum.length, 0, 360);
            var amp = Math.pow(spectrum[i],2)*ampConst;
            var r = map(amp, 0, 256, 20, 800);
            var x = mouseX+ r * cos(angle);
            var y = mouseY+ r * sin(angle);
            stroke(i+random(100), random(mouseX*0.5), random(mouseY*0.5),transp);
            line(mouseX, mouseY, x, y);
        }

    }
}

/**
function mouseDragged() {
    // Draw some white circles
    fill(255);
    noStroke();
    //ellipse(mouseX,mouseY,80,80);
    // Send the mouse coordinates
    sendmouse(mouseX,mouseY);
}
 **/

/**
function mouseClicked() {
    // Draw some white circles
    fill(255);
    noStroke();
    //ellipse(mouseX,mouseY,80,80);
    // Send the mouse coordinates
    sendmouse(mouseX,mouseY);
}
**/



function touchMoved() {

var xpos;
var ypos;

    for(var i = 0; i < touches.length; i+=touchStepSize)
    {
        xpos=touches[i].x;
        ypos=touches[i].y;

        // draw an ellipse
        fill(255, 0, 0);
        noStroke();

       // spectrum = fft.analyze();

        noStroke();

        for (var i = 0; i < spectrum.length; i+=stepSize) {
            var angle = map(i, 0, spectrum.length, 0, 360);
            var amp = Math.pow(spectrum[i],2)*ampConst;
            var r = map(amp, 0, 256, 20, 500);

            var x = xpos+ r * cos(angle);
            var y = ypos+ r * sin(angle);
            stroke(i+random(100), random(xpos*0.5), random(ypos*0.5),transp);
            line(xpos, ypos, x, y);

        }


        sendmouse(xpos,ypos);
    }

}


// Function for sending to the socket
function sendmouse(xpos, ypos) {
    // We are sending!
    console.log("sendmouse: " + xpos + " " + ypos);

    // Make a little object with  and y
    var data = {
        x: xpos,
        y: ypos
    };

    // Send that object to the socket
    socket.emit('mouse',data);
}