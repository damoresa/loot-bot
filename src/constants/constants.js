'use strict';

const CONSTANTS = {
    // Connectivity
    DATABASE: process.env.ATLAS_MONGODB_URI,
    DISCORD: {
        BOT_AUTH_TOKEN: process.env.DISCORD_BOT_AUTH_TOKEN,
        CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
        REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
        FRONT_REDIRECT_URI: process.env.DISCORD_FRONT_REDIRECT_URI
    },
    JWT: {
        HASH_SECRET: process.env.JWT_HASH_SECRET
    },
    // Utility
    BOT_NAME: 'loot-bot',
    COMMANDS_REGEXP: {
        BALANCE: /^!balance ([^\s]+)$/,
        EXPENSE: /^!expense ([^\s]+) ([^\s]+) ([^\s]+)$/,
        HELP: /^!help( ([^\s]+))*$/,
        LOOT: /^!loot ((.|[\r\n])+)$/,
        MONTHBALANCE: /^!monthbalance$/,
        MONTHHUNTS: /^!monthhunts$/,
        MONTHXP: /^!monthxp$/,
        PAY: /^!pay ([^\s]+)$/
    },
    DATA_REGEXP: {
        DAMAGE: /Damage: (\d+[,\d+]*)/,
        DETAIL_ENTRY: /\s*(None|(\d+)x [a|an ]*(['\w]+['\s\w]*))/,
        HEALING: /Healing: (\d+[,\d+]*)/,
        LOOT: /Loot: (\d+[,\d+]*)/,
        LOOT_ITEMS: /Looted items:/,
        MONSTERS: /Killed Monsters:/,
        SESSION_DATA: /Session data: From (\d{4}-\d{2}-\d{2}, \d{2}:\d{2}:\d{2}) to (\d{4}-\d{2}-\d{2}, \d{2}:\d{2}:\d{2})/,
        SESSION_TIME: /Session: (\d+:\d+)h/,
        SUPPLIES: /Supplies: (\d+[,\d+]*)/,
        XP: /XP Gain: (\d+[,\d+]*)/
    },
    PINCODE_LENGTH: 4
};

module.exports = CONSTANTS;
