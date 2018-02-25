const express = require('express');
const moment = require('moment');
const winston = require('winston');

const Parser = require('./../parser');
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
        this._router.post('/hunts', this.addHunt.bind(this));
        this._router.post('/hunts/:huntId/expense', this.addExpense.bind(this));
    }

    addHunt(request, response) {

        const username = request.user.username;
        const lootData = request.body.lootData;
		
		winston.debug(`${username} is storing: ${JSON.stringify(lootData)}`);

       Parser.parseWebLoot(username, lootData)
            .then(Service.saveLoot)
            .then((output) => {
                response.json({ message: `Report successfully stored with code ${output.code}` });
            })
            .catch((error) => {
                winston.error(`Unable to store hunt report for ${username}. Reason: ${error}`);
                response.json({ error: `Something went wrong, please contact an administrator.` });
            });
    }

    addExpense(request, response) {

        const username = request.user.username;
        const huntCode = request.params.huntId;
        const expenseData = request.body.expenseData;

        winston.debug(`${username} is storing: ${expenseData} cost on ${huntCode}`);

        Parser.parseWebExpense(username, huntCode, expenseData)
            .then(Service.saveExpense)
            .then((output) => {
                response.json({ message: `Expense of ${output.amount} registered for hunt ${output.code} by ${output.reporter}.` });
            })
            .catch((error) => {
                winston.error(`Unable to store expense for user ${username}: ${error}`);
                response.json({ error: `Something went wrong, please contact an administrator.` });
            });
    }

    loadHunts(request, response) {

        const username = request.user.username;
        const startDate = request.query.startDate;
        const endDate = request.query.endDate;

        Service.getUserHuntsData(username, startDate, endDate)
            .then((data) => {
                response.json({ data });
            })
            .catch((error) => {
                winston.error(`Unable to load hunts for ${user}. Reason: ${error}`);
                response.json({ error });
            });
    }

    loadHunt(request, response) {

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