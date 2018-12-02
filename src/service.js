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

    calculateBalance(huntCode) {
        return new Promise((resolve, reject) => {
            winston.info(`Generating balance report for hunt ${huntCode}.`);

            Storer.getBalanceData(huntCode).then(
                (balance) => {
                    resolve(balance);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    calculateMonthBalance(username) {
        return new Promise((resolve, reject) => {
            // FIXME: Add date filters so this becomes month data instead of overall data
            winston.info(`Generating month balance for user ${username}.`);

            Storer.getHuntsByUser(username).then(
                (hunts) => {
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

                    resolve(monthBalance);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    calculateMonthExp(username) {
        return new Promise((resolve, reject) => {
            winston.info(`Generating month experience report for user ${username}.`);

            const month = moment().startOf('month');
            const nextMonth = moment(month).add(1, 'month');

            Storer.getHuntsByUser(username, month, nextMonth).then(
                (hunts) => {
                    const totalxp = hunts.reduce((previousVal, hunt) => {
                        return previousVal + hunt.experience;
                    }, 0);
                    resolve(totalxp);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
	
	getHuntById(username, huntCode) {
        return new Promise((resolve, reject) => {
            winston.info(`Generating hunt ${huntCode} report user ${username}.`);

            Storer.getHuntByCode(username, huntCode)
                .then((hunt) => {
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

                    resolve(huntReportModel);
                })
                .catch((error) => {
                    reject(error);
                });
		});
	}

    getUserHuntsData(username, startDate, endDate) {
        return new Promise((resolve, reject) => {
            winston.info(`Generating hunts report user ${username}.`);

            const initDate = startDate ? moment(startDate, 'YYYY/MM/DD') : undefined;
            const lastDate = endDate ? moment(endDate, 'YYYY/MM/DD') : undefined;

            Storer.getHuntsByUser(username, initDate, lastDate)
                .then((hunts) => {
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
                        }
                    });

                    resolve(huntsReportModel);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    retrieveMonthHunts() {
        return new Promise((resolve, reject) => {
            winston.info('Generating hunts report for this month.');

            Storer.getMonthHunts().then(
                (hunts) => {
                    const monthHunts = hunts.map((hunt) => {
                        const monthHunt = new MonthHuntModel();
                        monthHunt.code = hunt.code;
                        monthHunt.date = moment(hunt.date).format('DD/MM/YYYY HH:mm:ss');
                        monthHunt.participants = hunt.expenses.map((expense) => {
                            return expense.reporter;
                        });
                        return monthHunt;
                    });
                    resolve(monthHunts);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    saveExpense(expense) {
        return new Promise((resolve, reject) => {
            winston.info(`Storing expense ${JSON.stringify(expense)}.`);

            Storer.persistExpense(expense).then(
                () => {
                    resolve(expense);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    saveLoot(report) {
        return new Promise((resolve, reject) => {
            winston.info(`Storing report ${JSON.stringify(report)}.`);

            Storer.persistLoot(report).then(
                (code) => {
                    report.code = code;
                    resolve(report);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
}

module.exports = new HuntService();