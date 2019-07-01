

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

var playedOnce = false;

var endingText = 'take a screenshot and post to instagram\n #comprehension_art     @noaru_band';

var unique_username = '';

var endingTextDarkness = 0;

var inp, submit_button;

var introP1;
var introP2;

var igOpen = false;

var igUser = '';

var allowDraw = false;

var p5canvas;



function preload() {
    song = loadSound('./comprehension.mp3');

}

function openIGapple(){
    if(igOpen === false) {
        igOpen = true;
        setTimeout(function () {
            window.open("instagram://user?username=NOARUband");
        }, 2000);
    }

}



function openIGandroid(){
    if(igOpen === false) {
        igOpen = true;
        setTimeout(function () {
            window.open("intent://instagram.com/_u/noaruband/#Intent;package=com.instagram.android;scheme=https;end");
        }, 2000);
    }

}



function toggleSong() {


    if (song.isPlaying()) {
        song.pause();
    } else {
        song.play();
        playedOnce=true;
        spectrum = fft.analyze();
    }

}

function playOtherUser(){
    socket.emit('getData',igUser);

        startDraw();
        button.hide();

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
    unique_username = inp.value();
    //button.show();
    startDraw();

    //console.log(unique_username);
}

function startDraw(){
    var p5body = select('body');
    var p5canvas2 = select('canvas');
    console.log('the body: ' + p5body)
    p5canvas2.elt.addEventListener('touchstart', function(e){ e.preventDefault(); });
    p5canvas2.elt.addEventListener('touchend', function(e){ e.preventDefault(); });
    p5canvas2.elt.addEventListener('touchmove', function(e){ e.preventDefault(); });
    p5canvas2.elt.addEventListener('touchcancel', function(e){ e.preventDefault(); });
    p5canvas2.elt.addEventListener('mousedown', function(e){ e.preventDefault(); });
    p5canvas2.elt.addEventListener('mousemove', function(e){ e.preventDefault(); });
    allowDraw = true;
    rEllipseSlider.show();
    ampScaleSlider.show();
    offScaleSlider.show();
    rSlider.show();
    gSlider.show();
    bSlider.show();
    submit_button.hide();
    inp.hide();
    introP1.hide();
    introP2.hide();

    toggleSong();

}


function setup() {

    //need to put all positions as relative to screen size

    button = createButton('/PLAY/');
    col = color(25,23,200,2);
    fontCol = color(255,255,255);
    button.style('font-size', '30px');
    button.style('background-color', col);
    button.style('color', fontCol);
    //button.position(10, 10);
    var buttonX = windowWidth*0.03;
    var buttonY = windowHeight*0.02
    button.position(buttonX, buttonY);
    button.hide();

    /*
    button_get = createButton('/GET/');
    button_get.style('font-size', '40px');
    button_get.style('background-color', col);
    button_get.style('color', fontCol);
    button_get.position(windowWidth*0.67, 10);
    */

    //slider min Value, max Value, starting Value, step size
    rEllipseSlider = createSlider(0, 2, 0,0.1);
    rEllipseSlider.id('redslider');
    //document.getElementById('redslider').fill = 'red';
    //var p5slider = select('slider');
    //rEllipseSlider.elt.style.fill="green !important";


    rEllipseSlider.hide();
    //rEllipseSlider.position(20, windowHeight*0.70);
    var sliderYpct = 0.7;
    rEllipseSlider.position(buttonX*2, windowHeight*sliderYpct);
    //rEllipseSlider.style('width', windowWidth*0.7+'px');
    var sliderStyle = windowWidth*sliderYpct+'px';
    rEllipseSlider.style('width', sliderStyle);

    ampScaleSlider = createSlider(0.5, 3, 1,0.1);
    ampScaleSlider.hide();
    ampScaleSlider.position(buttonX*2, windowHeight*(sliderYpct+0.05));
    ampScaleSlider.style('width', sliderStyle);

    offScaleSlider = createSlider(0, 2, 0,0.1);
    offScaleSlider.hide();
    offScaleSlider.position(buttonX*2, windowHeight*(sliderYpct+0.1));
    offScaleSlider.style('width', sliderStyle);



    rSlider = createSlider(0, 255, 100,1);

    var sliderColR = color(255,0,0);

    var sliderOutline = color(255,255,255);
    rSlider.style('fill', sliderColR);
    rSlider.style('stroke', sliderColR);
    rSlider.style('background-color', sliderColR);
    rSlider.style('outline', sliderColR);
    rSlider.style('-webkit-appearance', 'none');



    rSlider.hide();
    rSlider.position(buttonX*2, windowHeight*(sliderYpct+0.15));
    rSlider.style('width', sliderStyle);
    //rSlider.style('height', '40px');

    console.log(rSlider);

    gSlider = createSlider(0, 255, 100,1);

    var sliderColG = color(0,255,0);

    gSlider.style('fill', sliderColG);
    gSlider.style('stroke', sliderColG);
    gSlider.style('background-color', sliderColG);
    gSlider.style('outline', sliderColG);
    gSlider.style('-webkit-appearance', 'none');

    gSlider.hide();
    gSlider.position(buttonX*2, windowHeight*(sliderYpct+0.2));
    gSlider.style('width', sliderStyle);

    bSlider = createSlider(0, 255, 100,1);

    var sliderColB = color(0,0,255);

    bSlider.style('fill', sliderColB);
    bSlider.style('stroke', sliderColB);
    bSlider.style('background-color', sliderColB);
    bSlider.style('outline', sliderColB);
    bSlider.style('-webkit-appearance', 'none');


    bSlider.hide();
    bSlider.position(buttonX*2, windowHeight*(sliderYpct+0.25));
    bSlider.style('width', sliderStyle);

    sel = createSelect();


    sel.style('font-size', '30px');
    sel.style('background-color', col);
    sel.style('color', fontCol);

    //sel.position(buttonX*8, buttonY);
    sel.option('see other drawings');
    sel.changed(mySelectEvent);
    sel.style('width', windowWidth*0.4+'px');
    sel.style('display', 'table');
    sel.style('margin', '0 auto');

    //sel.style('display', 'table');
    //sel.style('margin-left', 'auto');
    //sel.style('margin-right', 'auto');
    sel.style('margin-top', '0%');
    sel.hide();


    introP1 = createP('_|welcome_to_noaru|_');
    introP1.style('font-size', '20px');
    //input.style('position', 'absolute');
    //input.style('top', '50%');

    introP1.style('display', 'table');
    introP1.style('margin', '0 auto');
    introP1.style('margin-top', '50%');
    //introP1.style('text-transform', 'lowercase');


    introP2 = createP('_|game_portal|_');
    introP2.style('font-size', '20px');
    //input.style('position', 'absolute');
    //input.style('top', '50%');

    introP2.style('display', 'table');
    introP2.style('margin', '0 auto');
    introP2.style('margin-top', '1%');
    //introP2.style('text-transform', 'lowercase');
    //inp = createInput();
    inp = createInput('').attribute('placeholder', 'enter instagram name');
    //input.position(windowWidth*0.5, windowHeight*0.45);

    inp.style('font-size', '20px');
    inp.style('text-align', 'center');



    //input.style('position', 'absolute');
    //input.style('top', '50%');

    inp.style('display', 'table');
    inp.style('margin', '0 auto');
    inp.style('margin-top', '5%');
    //input.style('text-align', 'center');

    submit_button = createButton('then click here to draw');
    //submit_button.position(windowWidth*0.5, windowHeight*0.55);
    submit_button.mousePressed(greet);

    submit_button.style('display', 'table');
    submit_button.style('margin', '0 auto');
    submit_button.style('margin-top', '5%');

    submit_button.style('font-size', '20px');
    //submit_button.style('size', '20px');
    submit_button.style('background-color', col);
    submit_button.style('color', fontCol);


    fill(255);

    textAlign(CENTER);


    var p5canvas = createCanvas(windowWidth*0.95, windowHeight*0.9);
    background(0);
    strokeWeight(5);

    button.mousePressed(playOtherUser);
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
    socket.on('run_user',
        function(data) {
            igUser = data;

            submit_button.hide();
            inp.hide();
            introP1.hide();
            introP2.hide();
            button.show();

            //starting animation right away
            //playOtherUser();



        }
    );


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
    frames += 1;


    if (frames > 0 && frames < 3600) {
        if (frames % 4 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 2);
        }
    }
    else if (frames > 3600 && frames < 7200) {
        if (frames % 6 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 1.5);
        }
    }
    else if (frames > 7200 && frames < 10800) {
        if (frames % 7 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 1.25);
        }
    }
    else if (frames > 10800) {

        if (frames % 8 === 0) {
            //console.log(frames);
            //fill(0,0,0,1);
            //rect(0,0,windowWidth,windowHeight);
            background(0, 0, 0, 1);
        }
    }

    if (playedOnce === true) {
        if (song.isPlaying() === false) {
            if(frames%15===0){
                endingTextDarkness+=0.5;
            }

            fill(50-endingTextDarkness,50-endingTextDarkness,50-endingTextDarkness,30);
            textSize(20);
            strokeWeight(0);
            endingText = 'your drawing will be posted soon to\n #comprehension_art     @noaru_band';


            text(endingText, windowWidth * 0.4, windowHeight * 0.6);
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                if( /Android/i.test(navigator.userAgent) ) {
                    //openIGandroid();
                }
                if( /iPhone|iPad/i.test(navigator.userAgent) ) {
                    //openIGapple();
                }
            }


            //var bandLink = createA('https://www.instagram.com/NOARUband/', 'your drawing will be posted here soon');
            //bandLink.position(200,200);

            //sel.show();
        }
        else {
            endingText = '';
        }
    }



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

        if (mouseY < windowHeight * (drawingCutOff-0.025) && mouseY>windowHeight*0.1 && allowDraw === true) {
            if (unique_username !== '') {
                sendmouse(mouseX, mouseY, unique_username);
            }
            drawSpectrum(mouseX, mouseY);
        }

        // Send the mouse coordinates

        spectrum = fft.analyze();


        if (touches.length > 0) {
            for (var i = 0; i < touches.length; i++) {

                if (touches[i].y < windowHeight * (drawingCutOff-0.025) && touches[i].y>windowHeight*0.1 && allowDraw === true) {
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
    strokeWeight(5);
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