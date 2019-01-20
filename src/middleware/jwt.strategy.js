'use strict';

const passportJwt = require('passport-jwt');
const winston = require('winston');

const CONSTANTS = require('./../constants/constants');
const User = require('./../schemas/user.schema');

const jwtExtractor = passportJwt.ExtractJwt;
const jwtStrategy = passportJwt.Strategy;

const opts = {};
opts.jwtFromRequest = jwtExtractor.fromAuthHeaderAsBearerToken();
opts.secretOrKey = CONSTANTS.JWT.HASH_SECRET;

const strategy = new jwtStrategy(opts, function(jwt_payload, done) {
    winston.debug(` JWT Stragegy retrieved token ${JSON.stringify(jwt_payload)}`);
    User.findOne(
        {
            discord_id: jwt_payload.discord_id,
            token_source: jwt_payload.token_source
        },
        function(err, user) {
            if (err) {
                return done(err, false);
            }

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        }
    );
});

module.exports = strategy;
