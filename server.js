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
var uri = 'mongodb://noaru_user:noarupw1@ds135217.mlab.com:35217/noaru';
//mongodb://<dbuser>:<dbpassword>@ds135217.mlab.com:35217/noaru

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function (socket) {

        //console.log("We have a new client: " + socket.id);

        // When this user emits, client side: socket.emit('otherevent',some data);
        socket.on('mouse',
            function(data) {

                var x = data.x;
                var y = data.y;
                var unique_id = socket.id;



                MongoClient.connect(uri, function (err, client) {

                    console.log("adding x and y to database")

                    if (err) throw err;

                    const coords = client.db('noaru').collection('coords');

                    //var coords = client.db.collection('coords');

                    coords.insert({username: 'reddog24',unique_id: unique_id,timestamp: Date.now(),x: x,y: y}, function (err, result) {

                        if (err) throw err;
                    });


                });


                console.log('done adding to db' + data);
                // Data comes in as whatever was sent, including objects
                //console.log("Received: 'mouse' " + data.x + " " + data.y);

                // Send it to all other clients
                socket.broadcast.emit('mouse', data);

                // This is a way to send to everyone including sender
                // io.sockets.emit('message', "this goes to everyone");

            }
        );

        socket.on('getData', function() {
            MongoClient.connect(uri, function (err, client) {

                console.log("retrieving data")

                if (err) throw err;

                const coords = client.db('noaru').collection('coords');

                //var coords = client.db.collection('coords');
                //db.bios.find().sort( { name: 1 } )
                coords.find({ username: 'reddog23' }).sort( { timestamp: 1 }).toArray(function(err, result) {
                    //coords.find({ username: 'redcat77' }).sort( { timestamp: 1 }).limit(1).toArray(function(err,
                    // result) {
                    /*
                    console.log("trying to find record");
                    console.log(result);
                    console.log(result[0]);
                    console.log(result[0].timestamp);
                    console.log(typeof result[0].timestamp);
                    */
                    var start_time = result[0].timestamp;

                    //start at second record
                    for(var i=1;i<result.length;i+=1) {
                        console.log(i);

                        var end_time = result[i].timestamp;

                        var time_diff = end_time - start_time;
                        console.log(time_diff);
                        var x = result[i].x;
                        var y = result[i].y;
                        var data = {
                            x: x,
                            y: y
                        };
                        console.log(data);
                        //io.emit('mouse', data);
                        //console.log(result[i]);
                        /*
                        setTimeout(function(){
                                io.emit('mouse', data);

                            }, time_diff);

                            //setTimeout(function(){
                                //io.sockets.emit('mouse', data);
                                //io.emit('mouse', data);
                                //console.log(data);
                            //},time_diff);

                        }
                        */
                        setDelay(data, time_diff);
                    }
                    //now start looking through the records one by one
                    //could get next record and then start a timer
                    //could cycle through each record in the array

                    if (err) throw err;
                });



            });
        });

        socket.on('disconnect', function() {
            //console.log("Client has disconnected");
        });
    }
);

function setDelay(data,time_diff) {
    setTimeout(function(){
        io.emit('mouse', data);
    }, time_diff);
}