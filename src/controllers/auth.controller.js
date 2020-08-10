'use strict';

const { URLSearchParams } = require('url');

const axios = require('axios');
const express = require('express');
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

    async validate(request, response) {
        const token = request.header('Authorization');
        const decodedToken = jwt.decode(token, CONSTANTS.JWT.HASH_SECRET);
        winston.debug('Allocated used', decodedToken);
        try {
            const user = await User.findOne({ discord_id: decodedToken.discord_id });
            let validToken = false;

            if (user) {
                validToken = true;
            }

            response.json({ validToken });
        } catch (err) {
            winston.error(`Unable to validate token ${token}`, err);
            response.status(500).json({ error: 'Error while validating token' });
        }
    }

    async callback(request, response) {
        if (!request.query.code) {
            response.status(500).json({ error: 'No code provided' });
        }

        const clientId = CONSTANTS.DISCORD.CLIENT_ID;
        const clientSecret = CONSTANTS.DISCORD.CLIENT_SECRET;
        const redirectUri = CONSTANTS.DISCORD.REDIRECT_URI;

        const code = request.query.code;

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            // Axios uses URLSearchParams to build form-urlencoded forms
            // https://github.com/axios/axios#using-applicationx-www-form-urlencoded-format
            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('code', code);
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', redirectUri);

            winston.debug("Invoking Discord's auth API", config, params);
            // The JWT is used to auth our application (front - back) and the JWT access token is stored safely.
            const jwtRes = await axios.post('https://discordapp.com/api/oauth2/token', params.toString(), config);
            const jwtData = jwtRes.data;

            winston.debug('JWT token successfully generated');

            const userData = await DiscordService.retrieveUserData(jwtData.access_token);
            let user = await User.findOne({ discord_id: userData.id, token_source: 'DISCORD' });

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
                    access_token: jwtData.access_token,
                    expires_in: jwtData.expires_in,
                    refresh_token: jwtData.refresh_token,
                    token_type: jwtData.token_type,
                    token_scope: jwtData.scope,
                    token_source: 'DISCORD'
                });

                await user.save();

                winston.debug('User successfully created ' + JSON.stringify(user));
                const token = jwt.encode(user, CONSTANTS.JWT.HASH_SECRET);
                response.redirect(`${CONSTANTS.DISCORD.FRONT_REDIRECT_URI}?token=${token}`);
            }
        } catch (err) {
            let error = `Error while retrieving user: ${err}`;
            if (err.response) {
                error += ` : ${err.response.data.error}`;
            }
            winston.error(error);
            response.json({ error });
        }
    }
}

module.exports = new AuthController();
