const mongoose = require('mongoose');
const winston = require('winston');

const constants = require('./constants/constants');

const launchDiscordBot = require('./bot');
const launchExpress = require('./express');

// Configure logger settings
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true
});
winston.level = process.env.LOGLEVEL || 'debug';

// MongoDB connection
mongoose.connect(constants.DATABASE);

// Launch Express
launchExpress();
// Launch Discord bot
launchDiscordBot();