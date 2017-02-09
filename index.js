// Copyright 2015, EMC, Inc.

'use strict';

var express = require('express');
var directory = require("serve-index");
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');
var ws = require('nodejs-websocket');
var wsConn;

var address = '0.0.0.0';
var httpPort = 3000;
var wsPort = 9100;

var wsServer = ws.createServer(function(conn){
    console.log("webSocket server created");

    wsConn = conn;

    conn.on('connect', function(something){
        console.log("webSocket connected", conn, something);
    });

    conn.on('text', function(str){
        console.log("webSocket text message received", str);
        // conn.sendText(JSON.stringify({"message": "hello stranger"}));
    });

    conn.on('close', function(code, reason){
        console.log("webSocket connection closed", code, reason);
    });
}).listen(wsPort, address, function(err){
    if(err){
        console.log("error create webSocket server", err);
    } else{
        console.log("webSocket server listening on", address, wsPort);
    }
});


var amqp = require('amqp');

var exchangeOption = {
    type: "topic",
    durable: true,
    autoDelete: false
};

var con = new amqp.createConnection({
    url: "amqp://guest:guest@10.62.59.220:56720"
});

con.on('ready', function() {
    console.log('amqp connection ready');
    con.ext = con.exchange("on.events", exchangeOption, function() {
        console.log('exchange created');
        var q = con.queue('eventQueue', {'exclusive': true}, function(queue) {
            console.log(queue.name + ' created');
            queue.bind('on.events', '#', function() {
                queue.subscribe(function(msg, header, deliveryInfo, msgObj) {
                    console.log('deliveryInfo', deliveryInfo)
                    console.log('msg', msg);
                    if(wsConn){
                        console.log('sending ws message');
                        wsConn.send(JSON.stringify({"msg":msg, "deliveryInfo": deliveryInfo}));
                    }

                })
            });
        });
    });
});

con.on('error', function(err) {
    console.log('amqp connection error', err);
});

