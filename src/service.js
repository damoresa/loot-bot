'use strict';

const moment = require('moment');
const winston = require('winston');

const HuntsReportModel = require('./models/hunts-report.model');
const SingleHuntReportModel = require('./models/hunt-report.model');
const MonthBalanceModel = require('./models/month-balance.model');
const MonthHuntModel = require('./models/month-hunt.model');
const Storer = require('./storer');

class HuntService {
    constructor() {
        this.calculateBalance.bind(this);
        this.calculateMonthBalance.bind(this);
        this.calculateMonthExp.bind(this);
        this.getHuntById.bind(this);
        this.getUserHuntsData.bind(this);
        this.retrieveMonthHunts.bind(this);
        this.saveExpense.bind(this);
        this.saveLoot.bind(this);
    }

    async calculateBalance(huntCode) {
        winston.info(`Generating balance report for hunt ${huntCode}.`);

        try {
            const balance = await Storer.getBalanceData(huntCode);
            return balance;
        } catch (err) {
            throw err;
        }
    }

    async calculateMonthBalance(username) {
        // FIXME: Add date filters so this becomes month data instead of overall data
        winston.info(`Generating month balance for user ${username}.`);

        try {
            const hunts = await Storer.getHuntsByUser(username);
            const monthBalance = new MonthBalanceModel();
            const expensesValue = hunts.reduce((expenses, hunt) => {
                return expenses.concat(hunt.expenses.filter((expense) => expense.reporter === username));
            }, []).reduce((cost, expense) => {
                return cost + expense.amount;
            }, 0);

            // Use the balance calculated field
            const lootValue = hunts.reduce((expenses, hunt) => {
                return expenses.concat(hunt.expenses.filter((expense) => expense.reporter === username));
            }, []).reduce((loot, expense) => {
                const balanceValue = expense.balance ? expense.balance : 0;

                return loot + balanceValue;
            }, 0);
            monthBalance.expenses = expensesValue;
            monthBalance.loot = lootValue;

            return monthBalance;
        } catch (err) {
            throw err;
        }
    }

    async calculateMonthExp(username) {
        winston.info(`Generating month experience report for user ${username}.`);

        try {
            const month = moment().startOf('month');
            const nextMonth = moment(month).add(1, 'month');

            const hunts = await Storer.getHuntsByUser(username, month, nextMonth);
            const totalxp = hunts.reduce((previousVal, hunt) => {
                return previousVal + hunt.experience;
            }, 0);
            return totalxp;
        } catch (err) {
            throw err;
        }
    }

    async getHuntById(username, huntCode) {
        winston.info(`Generating hunt ${huntCode} report user ${username}.`);

        try {
            const hunt = await Storer.getHuntByCode(username, huntCode);
            const huntReportModel = new SingleHuntReportModel();

            huntReportModel.code = hunt.code;
            huntReportModel.date = moment(hunt.date).format('DD/MM/YYYY HH:mm');
            huntReportModel.experience = hunt.experience;
            huntReportModel.loot = hunt.loot;
            huntReportModel.share = hunt.expenses.find((expense) => expense.reporter === username).balance;
            huntReportModel.expenses = hunt.expenses.reduce((aggregate, expense) => {
                return aggregate + expense.amount;
            }, 0);
            huntReportModel.items = hunt.items.map((item) => {
                return {
                    amount: item.amount,
                    name: item.name,
                };
            });
            huntReportModel.monsters = hunt.monsters.map((monster) => {
                return {
                    amount: monster.amount,
                    name: monster.name,
                };
            });
            huntReportModel.reporters = hunt.expenses.map((expense) => {
                return {
                    amount: expense.amount,
                    reporter: expense.reporter,
                };
            });

            return huntReportModel;
        } catch (err) {
            throw err;
        }
    }

    async getUserHuntsData(username, startDate, endDate) {
        winston.info(`Generating hunts report user ${username}.`);

        try {
            const initDate = startDate ? moment(startDate, 'YYYY/MM/DD') : undefined;
            const lastDate = endDate ? moment(endDate, 'YYYY/MM/DD') : undefined;

            const hunts = await Storer.getHuntsByUser(username, initDate, lastDate);

            const huntsReportModel = new HuntsReportModel();
            huntsReportModel.hunts = hunts.map((hunt) => {
                const reporterExpense = hunt.expenses.find((expense) => expense.reporter === username);
                return {
                    code: hunt.code,
                    date: moment(hunt.date).format('DD/MM/YYYY HH:mm'),
                    experience: hunt.experience,
                    share: reporterExpense.balance,
                    loot: hunt.loot,
                    expenses: reporterExpense.amount,
                };
            });

            return huntsReportModel;
        } catch (err) {
            throw err;
        }
    }

    async retrieveMonthHunts() {
        winston.info('Generating hunts report for this month.');

        try {
            const hunts = await Storer.getMonthHunts();
            const monthHunts = hunts.map((hunt) => {
                const monthHunt = new MonthHuntModel();
                monthHunt.code = hunt.code;
                monthHunt.date = moment(hunt.date).format('DD/MM/YYYY HH:mm:ss');
                monthHunt.participants = hunt.expenses.map((expense) => {
                    return expense.reporter;
                });
                return monthHunt;
            });
            return monthHunts;
        } catch (err) {
            throw err;
        }
    }

    async saveExpense(expense) {
        winston.info(`Storing expense ${JSON.stringify(expense)}.`);

        try {
            await Storer.persistExpense(expense);
            return expense;
        } catch (err) {
            throw err;
        }
    }

    async saveLoot(report) {
        winston.info(`Storing report ${JSON.stringify(report)}.`);

        try {
            const code = await Storer.persistLoot(report);
            report.code = code;
            return report;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new HuntService();