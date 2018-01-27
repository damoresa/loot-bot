const express = require('express');
const winston = require('winston');

const Service = require('./../service');

class ReportsController {

    get router() {
        return this._router;
    }

    constructor() {
        this.init();
    }

    init() {
        winston.debug(`Initializing ReportsController`);
        this._router = express.Router();
        this._router.get('/hunts', this.loadHunts.bind(this));
        this._router.get('/hunts/:huntId', this.loadHunt.bind(this));
    }

    loadHunts(request, response) {

        // TODO: Implement Passport JWT
        const username = request.user.username;
        const startDate = request.query.startDate;
        const endDate = request.query.endDate;

        Service.getUserHuntsData(username, startDate, endDate)
            .then((data) => {
                response.json({ data });
            })
            .catch((error) => {
                winston.error(`Unable to load hunts for r ${user}. Reason: ${error}`);
                response.json({ error });
            });
    }

    loadHunt(request, response) {

        // TODO: Implement Passport JWT
        const username = request.user.username;
		const huntId = request.params.huntId;

        Service.getHuntById(username, huntId)
            .then((data) => {
                response.json({ data });
            })
            .catch((error) => {
                winston.error(`Unable to load hunt with code ${huntId} for user ${user}. Reason: ${error}`);
                response.json({ error });
            });
    }

}

module.exports = new ReportsController();