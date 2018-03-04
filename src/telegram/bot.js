'use strict'



const Telegram = require('telegram-node-bot'),
	config = require('../../config'),
	TelegramBaseController = Telegram.TelegramBaseController,
	tg = new Telegram.Telegram(config.telegram_token),
	StartController = require('./StartController');


tg.router
	.when([
		config.START,
		config.DISABLE_RADAR,
		config.ENABLE_RADAR,
		config.SHOW_WHITE_LIST,
		config.CANCEL
	], new StartController());