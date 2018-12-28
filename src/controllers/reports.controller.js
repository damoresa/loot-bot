'use strict';

const express = require('express');
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
        this._router.post('/hunts/:huntId/paid', this.markPayment.bind(this));
    }

    addHunt(request, response) {

        const username = request.user.username;
        const userId = request.user.discord_id;
        const lootData = request.body.lootData;

		winston.debug(`${username} is storing: ${JSON.stringify(lootData)}`);

       Parser.parseWebLoot(username, userId, lootData)
            .then(Service.saveLoot)
            .then((output) => {
                response.json({ message: `Report successfully stored with code ${output.code}` });
            })
            .catch((error) => {
                winston.error(`Unable to store hunt report for ${username}. Reason: ${error}`);
                response.status(500).json({ error: `Unable to store hunt report.` });
            });
    }

    addExpense(request, response) {

        const username = request.user.username;
        const userId = request.user.discord_id;
        const huntCode = request.params.huntId;
        const expenseAmount = request.body.expenseAmount;
        const pinCode = request.body.pinCode;

        winston.debug(`${username} is storing: ${expenseAmount} cost on ${huntCode}`);

        Parser.parseWebExpense(username, userId, huntCode, expenseAmount, pinCode)
            .then(Service.saveExpense)
            .then((output) => {
                response.json({ message: `Expense of ${output.amount} registered for hunt ${output.code} by ${output.reporter}.` });
            })
            .catch((error) => {
                winston.error(`Unable to store expense for user ${username} with pin code ${pinCode}: ${error}`);
                response.status(500).json({ error: `Unable to store expense, please remember to input the correct pin code. If you don't have one, ask the hunt reporter for it.` });
            });
    }

    loadHunts(request, response) {

        const username = request.user.username;
        const userId = request.user.discord_id;
        const startDate = request.query.startDate;
        const endDate = request.query.endDate;
        const huntPaid = request.query.huntPaid;

        Service.getUserHuntsData(userId, startDate, endDate, huntPaid)
            .then((data) => {
                response.json({ data });
            })
            .catch((error) => {
                winston.error(`Unable to load hunts for ${username}. Reason: ${error}`);
                response.status(500).json({ error: `Unable to load hunts for ${username}` });
            });
    }

    loadHunt(request, response) {

        const username = request.user.username;
        const userId = request.user.discord_id;
		const huntId = request.params.huntId;

        Service.getHuntById(userId, huntId)
            .then((data) => {
                response.json({ data });
            })
            .catch((error) => {
                winston.error(`Unable to load hunt with code ${huntId} for user ${username}. Reason: ${error}`);
                response.status(500).json({ error: `Unable to load hunt with code ${huntId} for user ${username}` });
            });
    }

    markPayment(request, response) {

        const username = request.user.username;
        const userId = request.user.discord_id;
        const huntId = request.params.huntId;

        Parser.parseWebPayment(username, userId, huntId)
            .then(Service.savePayment)
            .then((output) => {
                response.json({ message: `Hunt ${output.code} has been marked as paid by ${output.reporter}` });
            })
            .catch((error) => {
                winston.error(`Unable mark hunt ${huntId} as paid by user ${username}. Reason: ${error}`);
                response.status(500).json({ error: `Unable mark hunt ${huntId} as paid by user ${username}` });
            });
    }

}

module.exports = new ReportsController();