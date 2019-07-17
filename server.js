// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

// HTTP Portion
var http = require('http');
// URL module
var url = require('url');
var path = require('path');

// Using the filesystem module
var fs = require('fs');
var hostname = '0.0.0.0';
//var hostname = '192.168.0.19';

var port = process.env.PORT || 3000;
var server = http.createServer(handleRequest);
var mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const test = require('assert');
var requestInfo ='';
var getAllUsersReq = false;
var imageName = '';
var userNames;
var speedFactor = 1;

server.listen(port, hostname, function(){
    //console.log('listening on ' + hostname + ':' + port);
});

console.log('Server started on port ' + port);

function handleRequest(req, res) {

    // What did we request?
    var pathname = req.url;

    // If blank let's ask for index.html
    if (pathname == '/') {
        pathname = '/index.html';
    }

    var pathName = url.parse(req.url, true).pathname;

    if (pathName == '/getuser') {
        pathname = '/index.html';
        var searchInfo = url.parse(req.url, true).search;
        requestInfo = searchInfo.substr(1);
    }

    if (pathName == '/getall') {
        pathname = '/index.html';
        getAllUsersReq = true;

        var speedFactorInfo = url.parse(req.url, true).search;
        speedFactor = speedFactorInfo.substr(1);
    }

    // Ok what's our file extension
    var ext = path.extname(pathname);

    // Map extension to file type
    var typeExt = {
        '.html': 'text/html',
        '.js':   'text/javascript',
        '.css':  'text/css'
    };

    // What is it?  Default to plain text
    var contentType = typeExt[ext] || 'text/plain';

    // User file system module
    fs.readFile(__dirname + pathname,
        // Callback function for reading
        function (err, data) {
            // if there is an error
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + pathname);
            }
            // Otherwise, send the data, the contents of the file
            res.writeHead(200,{ 'Content-Type': contentType });
            res.end(data);
        }
    );
}

var uri = 'mongodb://noaru_user:noarupw1@ds135217.mlab.com:35217/noaru?connectTimeoutMS=300000';

var coords;

MongoClient.connect(uri, function (err, client) {

    if (err) throw err;

    coords = client.db('noaru').collection('coords');

});

var options = { server:
        { socketOptions:
                {
                    //socketTimeoutMS: SOCKET_TIME_OUT_MS,
                    connectTimeoutMS: 10000
                }
        }
};

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function (socket) {

        function setDelay(data,time_diff) {
            setTimeout(function(){
                //only send to client
                socket.emit('mouse', data);
            }, time_diff);
        }

        if (requestInfo !=''){
            socket.emit('run_user',requestInfo);
        }

        //console.log("We have a new client: " + socket.id);
        // When this user emits, client side: socket.emit('otherevent',some data);
        socket.on('mouse',
            function(data) {

                var x = data.x;
                var y = data.y;
                var unique_id = socket.id;
                var unique_username = data.unique_username;
                var ampScale=data.ampScale;
                var xOffScale=data.xOffScale;
                var rSlider=data.rSlider;
                var gSlider=data.gSlider;
                var bSlider=data.bSlider;
                var rEllipseFactor=data.rEllipseFactor;

                    coords.insertOne({username: unique_username,unique_id: unique_id,timestamp: Date.now(),x: x,y: y,ampScale:ampScale,
                        xOffScale:xOffScale,
                        rSlider:rSlider,
                        gSlider:gSlider,
                        bSlider:bSlider,
                        rEllipseFactor:rEllipseFactor,

                    }, function (err, result) {

                        if (err) throw err;
                    });
            }
        );

        socket.on('getData', function(data) {

                coords.find({ username: data }).sort( { timestamp: 1 }).toArray(function(err, result) {
                    //start at second record
                    for(var i=1;i<result.length;i+=1) {
                        var time_diff = result[i].timestamp - result[0].timestamp;
                        //console.log('time_diff: ' + time_diff);
                        var data = {
                            x: result[i].x,
                            y: result[i].y,
                            ampScale:result[i].ampScale,
                            xOffScale:result[i].xOffScale,
                            rSlider:result[i].rSlider,
                            gSlider:result[i].gSlider,
                            bSlider:result[i].bSlider,
                            rEllipseFactor:result[i].rEllipseFactor
                        };
                        setDelay(data, time_diff);
                    }
            });
        });

        socket.on('getAllData', function(data) {
            var dataResult = data;
            //console.log('getalldata name: ' + data.userName);
            //console.log('getalldata num: ' + data.userNum);
            //console.log('getalldata total: ' + data.totalUsers);


            coords.find({ username: data.userName }).sort( { timestamp: 1 }).toArray(function(err, result) {
                console.log('result length: ' + result.length);
                let numRecordsInSegment = Math.floor(result.length / dataResult.totalUsers);
                let startRecordNum = 1 + Math.floor((dataResult.userNum-1) * result.length / dataResult.totalUsers);
                let endRecordNum = startRecordNum + numRecordsInSegment;

                if (endRecordNum>result.length){
                    endRecordNum=result.length-1;
                }
                //console.log('startrecordnum: ' + startRecordNum);
                //console.log('endrecordnum: ' + endRecordNum);

                //start at second record
                if (endRecordNum > startRecordNum) {

                    for (var i = startRecordNum; i < endRecordNum; i += 1) {
                        //console.log(result[i]);
                        var time_diff = (result[i+1].timestamp - result[startRecordNum].timestamp)*speedFactor;
                        var user_anim_length = (result[endRecordNum].timestamp - result[startRecordNum].timestamp)*speedFactor;
                        //console.log('result i+1: ' + result[i+1].timestamp);
                        //console.log('result i: ' + result[i].timestamp);
                        //console.log('time diff: ' + time_diff);
                        var sendData = {
                            x: result[i].x,
                            y: result[i].y,
                            ampScale: result[i].ampScale,
                            xOffScale: result[i].xOffScale,
                            rSlider: result[i].rSlider,
                            gSlider: result[i].gSlider,
                            bSlider: result[i].bSlider,
                            rEllipseFactor: result[i].rEllipseFactor,
                            userName: result[i].username
                        };
                        if (i < endRecordNum - 1 && (endRecordNum - startRecordNum > 1)) {
                            //console.log('record num: ' + i);
                            setDelay(sendData, time_diff);
                        } else {

                            setTimeout(function(){
                                //console.log('running next user');
                                socket.emit('run_next_user', 'next user');
                            },user_anim_length);

                        }
                    }
                }
                else{
                    //console.log('run next user');
                    socket.emit('run_next_user', 'next user');
                }

            });
        });

        socket.on('getUniqueUsernames', function(data) {
                coords.distinct('username', function(err, result) {
                        //console.log(result);
                        //only send to client
                    socket.emit('user_names',result);

                    if (err) throw err;
                });
        });

        if (getAllUsersReq === true){
            //console.log('getalluserreq');
            //setTimeout(function(){
                socket.emit('run_all_users','all users');
            //},200);

        }

        socket.on('disconnect', function() {

        });
    }
);

