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
//var hostname = '192.168.0.10';


var port = process.env.PORT || 3000;

var server = http.createServer(handleRequest);

var mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const test = require('assert');

server.listen(port, hostname, function(){
    //console.log('listening on ' + hostname + ':' + port);
});


//server.listen(8080);

console.log('Server started on port ' + port);

function handleRequest(req, res) {
    // What did we request?
    var pathname = req.url;

    // If blank let's ask for index.html
    if (pathname == '/') {
        pathname = '/index.html';
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

//var uri = 'mongodb://gameblocks:password@ds143608.mlab.com:43608/gameblocks';
var uri = 'mongodb://noaru_user:noarupw1@ds135217.mlab.com:35217/noaru?connectTimeoutMS=100000';
//mongodb://<dbuser>:<dbpassword>@ds135217.mlab.com:35217/noaru

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



                MongoClient.connect(uri, function (err, client) {

                    //console.log("adding x and y to database");
                    //console.log(unique_username);

                    if (err) throw err;

                    const coords = client.db('noaru').collection('coords');

                    //var coords = client.db.collection('coords');

                    coords.insertOne({username: unique_username,unique_id: unique_id,timestamp: Date.now(),x: x,y: y,ampScale:ampScale,
                        xOffScale:xOffScale,
                        rSlider:rSlider,
                        gSlider:gSlider,
                        bSlider:bSlider,
                        rEllipseFactor:rEllipseFactor,

                    }, function (err, result) {

                        if (err) throw err;
                    });

                    //client.close();


                });


                //console.log('done adding to db' + data);
                // Data comes in as whatever was sent, including objects
                //console.log("Received: 'mouse' " + data.x + " " + data.y);

                // No need with this version to send to all clients

                //socket.broadcast.emit('mouse', data);

                // This is a way to send to everyone including sender
                // io.sockets.emit('message', "this goes to everyone");

            }
        );

        socket.on('getData', function(data) {
            MongoClient.connect(uri, function (err, client) {

                //console.log("retrieving data")
                //console.log(data);

                if (err) throw err;

                const coords = client.db('noaru').collection('coords');

                coords.find({ username: data }).sort( { timestamp: 1 }).toArray(function(err, result) {

                    //var start_time = result[0].timestamp;

                    //start at second record
                    for(var i=1;i<result.length;i+=1) {
                        //console.log(i);

                        //var end_time = result[i].timestamp;

                        var time_diff = result[i].timestamp - result[0].timestamp;
                        //console.log(time_diff);

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
                        //console.log(data);

                        setDelay(data, time_diff);
                    }
                    //now start looking through the records one by one
                    //could get next record and then start a timer
                    //could cycle through each record in the array

                    if (err) throw err;
                });

                //client.close();

            });
        });

        socket.on('getUniqueUsernames', function(data) {
            MongoClient.connect(uri, function (err, client) {

                //console.log("getting usernames")
                //console.log(data);

                if (err) throw err;

                const coords = client.db('noaru').collection('coords');

                coords.distinct('username', function(err, result) {

                        //console.log(result);
                        //only send to client
                    socket.emit('user_names',result);

                    if (err) throw err;
                });

                //client.close();



            });
        });

        socket.on('disconnect', function() {
            //console.log("Client has disconnected");
        });
    }
);

