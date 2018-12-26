'use strict';

const Promise = require('bluebird');
const request = require('request');
const winston = require('winston');

class DiscordService {
    constructor() {}

    retrieveUserData(token) {

        winston.debug('Retrieving user data from Discord');

        const options = {
            url: 'http://discordapp.com/api/users/@me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                    winston.debug(body);
                    const parsedResponse = JSON.parse(body);
                    resolve(parsedResponse);
                } else {
                    reject(err);
                }
            });
        });
    }
}

module.exports = new DiscordService();