'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const path = require('path');
const winston = require('winston');

const jwtStrategy = require('./middleware/jwt.strategy');

const authController = require('./controllers/auth.controller');
const reportsController = require('./controllers/reports.controller');

const launchExpress = () => {
    // ExpressJS service
    const applicationPort = process.env.PORT || 3300;
    const application = express();

    // FIXME: CORS FILTER FOR DEVELOPMENT PURPOSES ONLY
    application.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, Authorization');
        // Allow all preflight OPTIONS requests in order to avoid issues since they don't have the Authorization header
        if (req.method == 'OPTIONS') {
            res.status(200).end();
        } else {
            next();
        }
    });

    // Server configuration
    // Configure Passport to use our JWT strategy and attach it to the application
    application.use(passport.initialize());
    passport.use(jwtStrategy);

    // Serve static resources and parse requests body as JSON
    application.use(bodyParser.json());
    application.use(bodyParser.urlencoded({
        extended: true
    }));
    application.use(express.static(path.join(__dirname, '..', 'public')));

    application.use('/auth', authController.router);
    application.all('/api/*', passport.authenticate('jwt', { session: false }));
    application.use('/api/reports', reportsController.router);

    // Default fallback for unbound requests
    application.get('*', (request, response) => {
        const indexPath = path.join(__dirname, '..', 'public', 'index.html');
        response.sendFile(indexPath);
    });


    application.listen(applicationPort, () => {
        winston.debug(`Loot-Bot backend listening on port ${applicationPort}!`)
    });

    application.on('error', (error) => {
        winston.error(` ## ERROR # ${error} ## `);
        throw error;
    });
};

module.exports = launchExpress;