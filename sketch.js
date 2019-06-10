

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
var angle;
var r;
var x;
var y;
var xOff;
var yOff;

var xOffScale=0.25;
var yOffScale=0.25;

var amp;
var countCx = 0;
var countCol = 0;
var ampScale = 1;
var ampExponent = 1;
let ampScaleSlider;
let infinitySlider;
let offScaleSlider;



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

function getData() {

    socket.emit('getData','getData');

}


function setup() {

    button = createButton('/PLAY/');
    col = color(25,23,200,2);
    fontCol = color(255,255,255);
    button.style('font-size', '40px');
    button.style('background-color', col);
    button.style('color', fontCol);
    button.position(10, 10);

    button_get = createButton('/GET/');
    button_get.style('font-size', '40px');
    button_get.style('background-color', col);
    button_get.style('color', fontCol);
    button_get.position(windowWidth*0.67, 10);

    ampScaleSlider = createSlider(0, 4, 0.25);
    ampScaleSlider.position(20, windowHeight*0.8);

    infinitySlider = createSlider(0, 4, 0.25);
    infinitySlider.position(20, windowHeight*0.825);

    offScaleSlider = createSlider(0, 4, 0.25);
    offScaleSlider.position(20, windowHeight*0.85);

    createCanvas(windowWidth*0.95, windowHeight*0.9);
    background(0);
    strokeWeight(20);

    button.mousePressed(toggleSong);
    button_get.mousePressed(getData);

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
            //spectrum = fft.analyze();
            //countCx+=1;
            //if(countCx%5===0) {
                drawSpectrum(data.x, data.y);
            //}

        }
    );
}

function draw() {

    ampScale = ampScaleSlider.value();
    ampExponent = infinitySlider.value();

    if(mouseIsPressed === true) {

        // Send the mouse coordinates

        spectrum = fft.analyze();


        for (var i = 0; i < touches.length; i++) {
            if(touches[i].y<windowHeight*0.75) {
                sendmouse(touches[i].x, touches[i].y);
                drawSpectrum(touches[i].x, touches[i].y);
                noStroke();
            }

        }

    }
}


function drawSpectrum(stX,stY) {
    for (var i = 0; i < spectrum.length; i+=stepSize) {
        angle = map(i, 0, spectrum.length, 0, 360);
        amp = Math.pow(spectrum[i],2)*ampConst*ampScale;
        r = map(amp, 0, 256, 20, 500);
        xOff = (stX+ r * cos(angle))*xOffScale;
        yOff = (stY+ pow(r * sin(angle),ampExponent))*yOffScale;
        x = stX+ r * cos(angle);
        y = stY+ pow(r * sin(angle),ampExponent);
        stroke(i+random(100), random(stX*0.5), random(stX*0.5),transp);
        line(stX+xOff, stY+yOff, x, y);
    }
}

// Function for sending to the socket
function sendmouse(xpos, ypos) {
    // We are sending!
    //console.log("sendmouse: " + xpos + " " + ypos);

    // Make a little object with  and y
    var data = {
        x: xpos,
        y: ypos
    };

    // Send that object to the socket
    socket.emit('mouse',data);
}