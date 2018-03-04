'use strict';

const express = require('express'),
    socketio = require('socket.io'),
    it = require('iterator-tools'),
    utils = require('./utils'),
    coordinates = require('./coordinates'),
    crawl = require('./crawl'),

    config = require('../config'),

    bot = require('./telegram/bot'),
    errors = require('./errors'),
    orchestrationUtils = require('./orchestration'),
    app = express(),
    server = app.listen(config.app.port, function() {
        var time = utils.getTimeTimeNow();
        console.log('[i] ' + time + ' - Server started');
    }),

    io = socketio.listen(server);

if (!config.leafletURL) {
    var time = utils.getTimeTimeNow();
    console.log('[e] ' + time + ' - Empty "leafletURL" field in config.js. Did you update your config?');
    process.exit(1);
}

var webUsers = new Map();
var maxOnline = 0;

// User accounts
const allAccountsConfig = config.webAccounts || [];
if (config.login) {
    var time = utils.getTimeTimeNow();
    console.log('[w] ' + time + ' - Warning: the configuration "login" field is deprecated, please use the "accounts" field instead.');
    allAccountsConfig.push(config.login);
}

// Socket for scanner position
io.on('connection', function(socket) {

    var userId = socket.conn.id;
    socket.emit('run', config.leafletURL);


    webUsers.delete(userId);

    var currentUser = {
        socket: socket,
        pointsOfInterest: new Map(),
        intervals: [],
        name: userId,
        loginInterval: {}
    }


    webUsers.set(userId, currentUser);

    if (webUsers.size > maxOnline) {
        maxOnline = webUsers.size;
    }
    var time = utils.getTimeTimeNow();
    console.log('[i] ' + time + ' - Connection: ' + userId + ' | Total web users: ' + webUsers.size + ", Max web users: " + maxOnline);
    orchestrationUtils.login(allAccountsConfig, currentUser, false);

    currentUser.loginInterval = setInterval(function() {
        time = utils.getTimeTimeNow();
        console.log('[i] ' + time + ' - Relogging for user: ' + userId)
        orchestrationUtils.login(allAccountsConfig, currentUser, true);
    }, 28 * 60 * 1000);

    socket.on('disconnect', function() {

        clearInterval(currentUser.loginInterval);

        if (currentUser.intervals) {
            for (const interval of currentUser.intervals) {
                clearInterval(interval);
            }
            currentUser.intervals = [];
        }
        webUsers.delete(userId);
        var time = utils.getTimeTimeNow();
        console.log('[i] ' + time + ' - Disconnection: ' + userId + ' | Total web users: ' + webUsers.size + ", Max web users: " + maxOnline);

    });


});

// App setup
app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/scan/:id/:lat/:lng', function(req, res) {

    var userId = req.params.id;
    var currentUser = webUsers.get(userId);

    if (!currentUser) {
        var time = utils.getTimeTimeNow();
        console.log('[w] ' + time + ' - No user!');
        return;
    }

    const location = {
        latitude: +req.params.lat,
        longitude: +req.params.lng,
        altitude: 0
    };

    // Delete it so it will be inserted at the end
    currentUser.pointsOfInterest.delete(userId);
    currentUser.pointsOfInterest.set(userId, {
        date: Date.now(),
        index: 0,
        location
    });

    webUsers.set(userId, currentUser);


    const position = Array.from(
        // Filter POIs that will be scanned in priority
        it.filter(
    orchestrationUtils.getActivePointOfInterests(currentUser.pointsOfInterest),
            (poi) => poi.index === 0
        )
    ).length;


    res.send({
        position,
        interval: config.moveInterval / 1000
    });
});