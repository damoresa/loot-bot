'use strict';

const btoa = require('btoa');
const express = require('express');
const Request = require('request');
const jwt = require('jwt-simple');
const winston = require('winston');

const CONSTANTS = require('./../constants/constants');
const DiscordService = require('../utils/discord.service');
const User = require('./../schemas/user.schema');

class AuthController {
    get router() {
        return this._router;
    }

    constructor() {
        this.init();
    }

    init() {
        winston.debug('Initializing AuthController');
        this._router = express.Router();
        this._router.get('/discord/login', this.login.bind(this));
        this._router.post('/discord/validate', this.validate.bind(this));
        this._router.get('/discord/callback', this.callback.bind(this));
    }

    login(request, response) {
        const clientId = CONSTANTS.DISCORD.CLIENT_ID;
        const redirectUri = encodeURIComponent(CONSTANTS.DISCORD.REDIRECT_URI);
        response.redirect(
            `https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=identify&response_type=code&redirect_uri=${redirectUri}`
        );
    }

    validate(request, response) {
        const token = request.header('Authorization');
        const user = jwt.decode(token, CONSTANTS.JWT.HASH_SECRET);
        winston.debug(user);
        User.findOne({ discord_id: user.discord_id }, (err, user) => {
            if (err) {
                response.status(500).json({ error: 'Error while validating token ' });
            } else {
                let validToken = false;

                if (user) {
                    validToken = true;
                }

                response.json({ validToken });
            }
        });
    }

    callback(request, response) {
        if (!request.query.code) {
            response.status(500).json({ error: 'No code provided' });
        }

        const clientId = CONSTANTS.DISCORD.CLIENT_ID;
        const clientSecret = CONSTANTS.DISCORD.CLIENT_SECRET;
        const redirectUri = encodeURIComponent(CONSTANTS.DISCORD.REDIRECT_URI);

        const code = request.query.code;
        const credentials = btoa(`${clientId}:${clientSecret}`);

        const options = {
            url: `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`
            }
        };

        // The JWT is used to auth our application (front - back) and the JWT access token is stored safely.
        Request(options, (err, res, body) => {
            if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                const parsedBody = JSON.parse(body);

                DiscordService.retrieveUserData(parsedBody.access_token).then(
                    (userData) => {
                        User.findOne(
                            {
                                discord_id: userData.id,
                                token_source: 'DISCORD'
                            },
                            (err, user) => {
                                if (err) {
                                    const error = `Error while retrieving user: ${err}`;
                                    winston.error(error);
                                    response.status(500).json({ error });
                                } else {
                                    if (user) {
                                        winston.debug(`${user.username} found`);
                                        const token = jwt.encode(user, CONSTANTS.JWT.HASH_SECRET);
                                        response.redirect(`${CONSTANTS.DISCORD.FRONT_REDIRECT_URI}?token=${token}`);
                                    } else {
                                        winston.debug(`${userData.username} not found, creating a new user`);
                                        user = new User({
                                            discord_id: userData.id,
                                            discord_discriminator: userData.discriminator,
                                            username: userData.username,
                                            access_token: parsedBody.access_token,
                                            expires_in: parsedBody.expires_in,
                                            refresh_token: parsedBody.refresh_token,
                                            token_type: parsedBody.token_type,
                                            token_scope: parsedBody.scope,
                                            token_source: 'DISCORD'
                                        });

                                        user.save((err) => {
                                            if (err) {
                                                const error = `Unable to create new user: ${err}`;
                                                winston.error(error);
                                                response.status(500).json({ error });
                                            } else {
                                                winston.debug('User successfully created ' + JSON.stringify(user));
                                                const token = jwt.encode(user, CONSTANTS.JWT.HASH_SECRET);
                                                response.redirect(
                                                    `${CONSTANTS.DISCORD.FRONT_REDIRECT_URI}?token=${token}`
                                                );
                                            }
                                        });
                                    }
                                }
                            }
                        );
                    },
                    (err) => {
                        const error = `Error while retrieving user: ${err}`;
                        winston.error(error);
                        response.json({ error });
                    }
                );
            }
        });
    }
}

module.exports = new AuthController();
