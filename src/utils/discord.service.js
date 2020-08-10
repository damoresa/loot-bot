'use strict';

const axios = require('axios');
const winston = require('winston');

class DiscordService {
    constructor() {}

    async retrieveUserData(token) {
        winston.debug('Retrieving user data from Discord');

        const headers = {
            Authorization: `Bearer ${token}`
        };

        const response = await axios.get('http://discordapp.com/api/users/@me', { headers });
        winston.debug('Allocated user data', response.data);
        return response.data;
    }
}

module.exports = new DiscordService();
