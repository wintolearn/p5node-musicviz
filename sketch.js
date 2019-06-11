

// Keep track of our socket connection
var socket;
var song;
var fft;
var button;
var spectrum;
var stepSize = 4;
var touchStepSize = 2;
var transp = 140;
var ampConst = 0.015;
var angle;
var rad;
var x;
var y;
var xOff;
var yOff;

var xOffScale=0.25;
var yOffScale=xOffScale*1.2;

var amp;
var countCx = 0;
var countCol = 0;
var ampScale = 1;
var ampExponent = 1;
var rEllipseFactor = 1;

let ampScaleSlider;
let offScaleSlider;
let rSlider;
let gSlider;
let bSlider;
let rEllipseSlider;

var drawingCutOff = 0.7;

var slider1,slider2,slider3,slider4,slider5;

var r = 100;
var g = 100;
var b = 100;

var sel;
var frames=0;

var unique_username = '';

let input, submit_button;



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

function mySelectEvent() {
    toggleSong();
    var item = sel.value();
    socket.emit('getData',item);
    //text('It is a ' + item + '!', 50, 50);
}

function greet(){
    unique_username = input.value();
    //console.log(unique_username);
}


function setup() {

    button = createButton('/PLAY/');
    col = color(25,23,200,2);
    fontCol = color(255,255,255);
    button.style('font-size', '30px');
    button.style('background-color', col);
    button.style('color', fontCol);
    button.position(10, 10);

    /*
    button_get = createButton('/GET/');
    button_get.style('font-size', '40px');
    button_get.style('background-color', col);
    button_get.style('color', fontCol);
    button_get.position(windowWidth*0.67, 10);
    */

    //slider min Value, max Value, starting Value, step size
    rEllipseSlider = createSlider(0, 2, 0,0.1);
    rEllipseSlider.position(20, windowHeight*0.70);
    rEllipseSlider.style('width', windowWidth*0.7+'px');

    ampScaleSlider = createSlider(0.5, 3, 1,0.1);
    ampScaleSlider.position(20, windowHeight*0.75);
    ampScaleSlider.style('width', windowWidth*0.7+'px');

    offScaleSlider = createSlider(0, 2, 0,0.1);
    offScaleSlider.position(20, windowHeight*0.8);
    offScaleSlider.style('width', windowWidth*0.7+'px');

    rSlider = createSlider(0, 255, 100,1);
    rSlider.position(20, windowHeight*0.85);
    rSlider.style('width', windowWidth*0.7+'px');

    gSlider = createSlider(0, 255, 100,1);
    gSlider.position(20, windowHeight*0.9);
    gSlider.style('width', windowWidth*0.7+'px');

    bSlider = createSlider(0, 255, 100,1);
    bSlider.position(20, windowHeight*0.95);
    bSlider.style('width', windowWidth*0.7+'px');

    sel = createSelect();

    sel.style('font-size', '20px');
    sel.style('background-color', col);
    sel.style('color', fontCol);

    sel.position(windowWidth*0.25+50, windowHeight*0.05);
    sel.option('see other drawings');
    sel.changed(mySelectEvent);

    input = createInput();
    input.position(windowWidth*0.45+50, 10);

    input.value('enter instagram name');

    submit_button = createButton('submit');
    submit_button.position(windowWidth*0.25+50, 10);
    submit_button.mousePressed(greet);

    submit_button.style('font-size', '20px');
    submit_button.style('size', '20px');
    submit_button.style('background-color', col);
    submit_button.style('color', fontCol);


    fill(255);

    textAlign(CENTER);


    createCanvas(windowWidth*0.95, windowHeight*0.9);
    background(0);
    strokeWeight(5);

    button.mousePressed(toggleSong);
    //button_get.mousePressed(getData);

    angleMode(DEGREES);


    fft = new p5.FFT(0.9, 128);

    // Start a socket connection to the server
    // Some day we would run this server somewhere else
    //socket = io.connect('http://localhost:8080');

    socket = io();

    socket.emit('getUniqueUsernames','getUniqueUsernames');
    // We make a named event called 'mouse' and write an
    // anonymous callback function
    socket.on('mouse',
        // When we receive data
        function(data) {
            //console.log("Got: " + data.x + " " + data.y);
            // Draw a blue circle
            spectrum = fft.analyze();
            //countCx+=1;
            //if(countCx%5===0) {

            //if(ampScale!==ampScaleSlider.value()||xOffScale !== offScaleSlider.value()||r !== rSlider.value()||g
            // !== gSlider.value()||b !== bSlider.value()||rEllipseFactor !== rEllipseSlider.value())
            //{

                ampScaleSlider.value(data.ampScale);
                offScaleSlider.value(data.xOffScale);
                rSlider.value(data.rSlider);
                gSlider.value(data.gSlider);
                bSlider.value(data.bSlider);
                rEllipseSlider.value(data.rEllipseFactor);
            //}


            drawSpectrum(data.x, data.y);
            //}

        }
    );


    socket.on('user_names',
        // When we receive data
        function(data) {
        //console.log('processing data');
        //console.log(data);

            for(var i=0;i<data.length;i++){
                sel.option(data[i]);
            }



        }
    );



}

function draw() {
    //frames+=1;

    /*
    if(frames>0&&frames<3600) {
        if (frames % 4 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 2);
        }
    }
    else if(frames>3600&&frames<7200) {
        if (frames % 6 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 1.5);
        }
    }
    else if(frames>7200&&frames<10800) {
        if (frames % 7 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 1.25);
        }
    }
    else if(frames>10800) {

        if (frames % 8 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 1);
        }
    }
    */



    /*
    if(ampScale!==ampScaleSlider.value()||xOffScale !== offScaleSlider.value()||r !== rSlider.value()||g !== gSlider.value()||b !== bSlider.value()){
        var data = {
            ampScale:ampScale,
            xOffScale:xOffScale,
            rSlider:rSlider,
            gSlider:gSlider,
            bSlider:bSlider
        }

        socket.emit('newSliderVals',data);

    }
    */

    ampScale = ampScaleSlider.value();
    xOffScale = offScaleSlider.value();
    r = rSlider.value();
    g = gSlider.value();
    b = bSlider.value();
    rEllipseFactor = rEllipseSlider.value();


    if(mouseIsPressed === true) {

        if (mouseY < windowHeight * (drawingCutOff-0.025) && mouseY>windowHeight*0.1) {
            if (unique_username !== '') {
                sendmouse(mouseX, mouseY, unique_username);
            }
            drawSpectrum(mouseX, mouseY);
        }

        // Send the mouse coordinates

        spectrum = fft.analyze();


        if (touches.length > 0) {
            for (var i = 0; i < touches.length; i++) {

                if (touches[i].y < windowHeight * (drawingCutOff-0.025) && touches[i].y>windowHeight*0.1) {
                    if (unique_username !== '') {
                        sendmouse(touches[i].x, touches[i].y, unique_username);
                    }
                    drawSpectrum(touches[i].x, touches[i].y);

                    noStroke();
                }

            }
        }

    }
}

var randColorDiv = 1.5;

function drawSpectrum(stX,stY) {
    //console.log(spectrum);
    if (spectrum !== undefined) {
        for (var i = 20; i < spectrum.length-40; i += stepSize) {
            angle = map(i, 20, spectrum.length-40, 0, 360);
            amp = Math.pow(spectrum[i], 1.65) * ampConst * ampScale;
            rad = Math.min(map(amp, 0, 256, 20, windowWidth*0.5),windowWidth*0.3);
            xOff = (rad * cos(angle)) * xOffScale;
            yOff = (pow(rad * sin(angle), ampExponent)) * yOffScale;
            x = stX + rad * cos(angle);
            y = stY + pow(rad * sin(angle), ampExponent);
            //stroke(r+(i + random(100))/50, random(stX * 0.5), random(stX * 0.5), transp);
            stroke(r+(i/5 + random(200))/randColorDiv, g+(i/5 + random(200))/randColorDiv, b+(i/5 + random(200))/randColorDiv, transp);
            fill(r+(i/5 + random(200))/randColorDiv, g+(i/5 + random(200))/randColorDiv, b+(i/5 + random(200))/randColorDiv, transp/7);
            ellipse(x,y,rad*rEllipseFactor,rad*rEllipseFactor);
            line(stX + xOff, stY + yOff, x, y);
        }
    }
}

// Function for sending to the socket
function sendmouse(xpos, ypos,unique_username) {
    // We are sending!
    //console.log("sendmouse: " + xpos + " " + ypos);

    // Make a little object with  and y
    var data = {
        x: xpos,
        y: ypos,
        unique_username: unique_username,
        ampScale:ampScale,
        xOffScale:xOffScale,
        rSlider:r,
        gSlider:g,
        bSlider:b,
        rEllipseFactor:rEllipseFactor
    };

    // Send that object to the socket
    socket.emit('mouse',data);
}