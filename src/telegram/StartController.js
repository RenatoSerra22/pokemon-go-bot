const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require('../../config');
const utils = require('../utils');
const whitelist = require('../../white-list');
var orchestrationUtils = require('../orchestration');


const util = require('util');


class StartController extends TelegramBaseController {

    constructor() {
        super();
        this.Users = new Map();
        this.maxOnline = 0;
    }

    addUserDestails($) {

        var pointsOfInterest = new Map();
        var userId = $.userId;

        this.deleteUser(userId);

        var currentUser = {
            lastAction: $.message.text,
            telegram: $,
            notifiedList: new Map(),
            name: $.message.from.firstName + ' ' + $.message.from.lastName,
            pointsOfInterest: pointsOfInterest,
            intervals: []
        };


        orchestrationUtils.login(config.botAccounts, currentUser, false);

        currentUser.loginInterval = setInterval(function() {
            var time = utils.getTimeTimeNow();
            console.log('[i] ' + time + ' - Relogging for user: ' + currentUser.name)
            orchestrationUtils.login(config.botAccounts, currentUser, true);
        }, 25 * 60 * 1000);


        this.Users.set(userId, currentUser);

    }

    deleteUser(userId) {

        var user = this.Users.get(userId);
        if (user && user.intervals) {
            for (const interval of user.intervals) {
                clearInterval(interval);
            }
            clearInterval(user.loginInterval);
        }

        this.Users.delete(userId);
        if (user) {
            var time = utils.getTimeTimeNow();
            console.log('[i] ' + time + ' - Telegram User Stopped: ' + user.name + ' | Total Telegram users: ' + this.Users.size + ", Max Telegram users: " + this.maxOnline);
        }

    }



    addUserLocation($) {

        var userId = $.userId;
        var currentUser = this.Users.get(userId);

        if (currentUser.pointsOfInterest.size == 0) {
            if (this.Users.size > this.maxOnline) {
                this.maxOnline = this.Users.size;
            }
            var time = utils.getTimeTimeNow();
            console.log('[i] ' + time + ' -  New Telegram User: ' + currentUser.name + ' | Total Telegram users: ' + this.Users.size + ", Max Telegram users: " + this.maxOnline);
        }
        const location = {
            latitude: +$.message.location.latitude,
            longitude: +$.message.location.longitude,
            altitude: 0
        };

        // Delete it so it will be inserted at the end
        currentUser.pointsOfInterest.delete(userId);
        currentUser.pointsOfInterest.set(userId, {
            date: Date.now(),
            index: 0,
            location
        });

        this.Users.set(userId, currentUser);

    }

    requestLocation($) {

        $.sendMessage('I need a location!  Send current from menu or custom as attachment!', {
            disable_notification: true,
            reply_markup: JSON.stringify({
                keyboard: [
                    [{
                        text: 'Here, take my current location!',
                        request_location: true
                    }],
                    [{
                        text: config.CANCEL
                    }]
                ]
            })
        });

    }

    enableRadarHandler($) {
        this.addUserDestails($);
        this.requestLocation($);
    }

    disableRadarHandler($) {
        var userId = $.userId;
        this.deleteUser(userId);
        $.sendMessage('Radar has been disabled bro! Of you go now.');
    }
    showListHandler($) {
        var text = '';
        var counter = 0;
        for (const key in whitelist) {

            if (!whitelist.hasOwnProperty(key)) continue;

            text += whitelist[key] + ', ';
            counter++;
        }
        text = 'Tracking ' + counter + ' pokemons, heres the list: ' + text;
        $.sendMessage(text);
    }

    startHandler($) {
        var menu = {
            [config.ENABLE_RADAR]: () => {},
            [config.DISABLE_RADAR]: () => {},
            [config.SHOW_WHITE_LIST]: () => {},
            'anyMatch': () => { //will be executed at any other message
            }
        };

        //if we got a message without any text but has a location add that to the user data
        if ($.message.text == null && $.message.location && this.Users.get($.userId)) {

            this.addUserLocation($);

            menu.message = 'Okay ill be looking for them good pokies bro, ill holla at ya!';

        } else {

            menu.message = 'Hey what do you wanna do?';

        }

        $.runMenu(menu);

    }

    get routes() {
        return {
            [config.START]: 'startHandler',
            [config.ENABLE_RADAR]: 'enableRadarHandler',
            [config.DISABLE_RADAR]: 'disableRadarHandler',
            [config.SHOW_WHITE_LIST]: 'showListHandler',
            [config.CANCEL]: 'startHandler'
        }

    }
}
module.exports = StartController;