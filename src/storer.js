'use strict';

const moment = require('moment');
const winston = require('winston');

const BalanceModel = require('./models/balance.model');
const ExpenseModel = require('./models/expense.model');

// Import Mongoose Schemas. Order is relevant in case they've not been importer and initialized in the
// Mongoose context before.
/* eslint-disable */
const Expense = require('./schemas/expense.schema');
const Item = require('./schemas/item.schema');
const Monster = require('./schemas/monster.schema');
/* eslint-enable */
const Hunt = require('./schemas/hunt.schema');

const parseExpense = (expense) => {
    return {
        amount: Number(expense.amount),
        reporter: expense.reporter,
        reporterId: expense.reporterId,
        balance: 0
    };
};

const parseItems = (items) => {
    return items.map((item) => {
        return {
            amount: item.amount,
            name: item.name
        };
    });
};

const calculateBalance = (hunt, expensesData) => {
    const totalExpenses = expensesData.reduce((total, data) => {
        return total + data.amount;
    }, 0);

    const profitHunt = totalExpenses < hunt.loot;
    let data;

    winston.debug(`Looted ${hunt.loot} and spent ${totalExpenses}`);

    if (profitHunt) {
        const profit = Math.floor((hunt.loot - totalExpenses) / expensesData.length);
        data = expensesData.map((expense) => {
            expense.balance = expense.amount + profit;

            winston.debug(
                `Reporter ${expense.reporter} was assigned his expense of ${
                    expense.amount
                } and a profit of ${profit} (${expense.balance})`
            );

            return expense;
        });
    } else {
        data = expensesData.map((expense) => {
            // FIXME: Keep an eye on this Math.round as it may play nasty tricks on some balances. Floor swallowed 1% a couple times :(
            const percentage = Number((Math.round((expense.amount / totalExpenses) * 100) / 100).toFixed(2));
            expense.balance = Math.floor(hunt.loot * percentage);

            winston.debug(
                `Reporter ${expense.reporter} was assigned a ${percentage * 100}% of the loot (${expense.balance})`
            );

            return expense;
        });
    }

    return data;
};

const parseMonsters = (monsters) => {
    return monsters.map((monster) => {
        return {
            amount: monster.amount,
            name: monster.name
        };
    });
};

class Storer {
    constructor() {
        this.getBalanceData.bind(this);
        this.getHuntByCode.bind(this);
        this.getHuntsByUser.bind(this);
        this.getMonthHunts.bind(this);
        this.persistExpense.bind(this);
        this.persistLoot.bind(this);
        this.persistPayment.bind(this);
    }

    async getBalanceData(code) {
        winston.debug(`Generating balance for hunt ${code}`);

        try {
            const hunt = await Hunt.findOne({ code: code });
            if (hunt) {
                const balance = new BalanceModel();
                balance.code = hunt.code;
                balance.loot = hunt.loot;

                // FIXME: MongoDB aggregated query?
                balance.balances = hunt.expenses.map((expense) => {
                    return {
                        amount: expense.amount,
                        balance: expense.balance,
                        reporter: expense.reporter
                    };
                });
                balance.expenses = hunt.expenses.reduce((total, expense) => {
                    return total + expense.amount;
                }, 0);

                return balance;
            } else {
                throw Error(`Unable to find hunt with code ${code}`);
            }
        } catch (err) {
            throw err;
        }
    }

    async getHuntByCode(userId, huntCode) {
        winston.debug(`Retrieving hunt ${huntCode} for user ${userId}`);

        try {
            const query = {
                code: huntCode,
                'expenses.reporterId': userId
            };

            const hunt = await Hunt.findOne(query);
            if (hunt) {
                return hunt;
            } else {
                throw Error(`Unable to find hunt with code ${huntCode} and reporter ${userId}`);
            }
        } catch (err) {
            throw err;
        }
    }

    async getHuntsByUser(userId, startDate, endDate, huntPaid) {
        winston.debug(`Retrieving ${huntPaid ? 'paid' : 'unpaid'} hunts for user ${userId}`);
        winston.debug(`Date range: ${startDate} -> ${endDate}`);

        try {
            const query = {
                'expenses.reporterId': userId
            };

            if (startDate && endDate) {
                query['date'] = { $gte: startDate.toDate(), $lt: endDate.toDate() };
            } else if (startDate) {
                query['date'] = { $gte: startDate.toDate() };
            } else if (endDate) {
                query['date'] = { $lt: endDate.toDate() };
            }

            if (huntPaid) {
                query['paid'] = huntPaid;
            }

            return await Hunt.find(query).sort('date');
        } catch (err) {
            throw err;
        }
    }

    async getMonthHunts() {
        winston.debug("Generating this month's hunts report");

        try {
            const month = moment().startOf('month');
            const nextMonth = moment(month).add(1, 'month');

            winston.debug(`Current month: ${month}`);
            winston.debug(`Next month: ${nextMonth}`);

            return await Hunt.find({ date: { $gte: month.toDate(), $lt: nextMonth.toDate() } }).sort('date');
        } catch (err) {
            throw err;
        }
    }

    async persistExpense(expense) {
        // The loot share calculation is done according to the following:
        /*
        1. Sum up all the hunt expenses
        2. Validate whether the addition of expenses is lower (2.1) or higher (2.2) than the total loot value
            2.1.1 Calculate the percentage of cost over the total expenses
            2.1.2 Calculate loot share using that percentage over the total loot value

            2.2.1 Substract total expenses value from total loot value
            2.2.2 Calculate loot share by evenly splitting profit
        3. This has to be done for each expense added to the hunt every time a new expense is added in order
            to avoid recalculating it on every query - generally, the amount of times an expense will be registered
            is much lower than the amount of times it'll be queried
         */
        winston.debug(`Registering expense ${JSON.stringify(expense)}`);
        try {
            const hunt = await Hunt.findOne({ code: expense.code, pinCode: expense.pinCode });

            if (hunt) {
                const parsedExpense = parseExpense(expense);
                // Map the existing data to a readable format
                const currentData = hunt.expenses.map((expenseData) => {
                    return {
                        amount: expenseData.amount,
                        balance: expenseData.balance,
                        reporter: expenseData.reporter,
                        reporterId: expenseData.reporterId
                    };
                });

                winston.debug(`Current data: ${JSON.stringify(currentData)}`);

                const expenseExists = currentData.find((data) => data.reporterId === parsedExpense.reporterId);

                let calculatedData;
                if (expenseExists) {
                    winston.debug(`Expense already exists for hunt ${expense.code} and reporter ${expense.reporter}`);

                    // Update the existing data
                    currentData.forEach((entry) => {
                        if (entry.reporterId === parsedExpense.reporterId) {
                            entry.amount = parsedExpense.amount;
                            entry.balance = 0;
                        }
                    });

                    // Calculate balances for everyone
                    calculatedData = calculateBalance(hunt, currentData);
                } else {
                    winston.debug(`New expense for hunt ${expense.code} and reporter ${expense.reporter}`);

                    // Add the new data
                    currentData.push({
                        amount: parsedExpense.amount,
                        balance: 0,
                        reporter: parsedExpense.reporter,
                        reporterId: parsedExpense.reporterId
                    });
                    hunt.expenses.push(parsedExpense);

                    // Calculate balances for everyone
                    calculatedData = calculateBalance(hunt, currentData);
                }

                // Apply the calculated data
                winston.debug(`Calculated balance: ${JSON.stringify(calculatedData)}`);
                hunt.expenses.forEach((expenseData) => {
                    const reporterData = calculatedData.find((data) => data.reporterId === expenseData.reporterId);
                    expenseData.amount = reporterData.amount;
                    expenseData.balance = reporterData.balance;
                });

                // Save the data
                try {
                    await hunt.save();
                } catch (error) {
                    winston.error(`Unable to persist expense: ${error}`);
                    throw error;
                }

                // Return something
                return true;
            } else {
                throw Error(`Unable to find hunt with code ${expense.code} and pin ${expense.pinCode}`);
            }
        } catch (err) {
            throw err;
        }
    }

    async persistLoot(report) {
        winston.debug('Storing loot information.');

        try {
            // MomentJS for date management
            const startTime = moment(report.sessionStartTime, 'YYYY-MM-DD HH:mm:ss');
            // Duration to MS
            const duration = moment(report.sessionTime, 'HH:mm').valueOf();
            // Initial expense
            const expense = new ExpenseModel();
            expense.amount = report.supplies;
            expense.reporter = report.reporter;
            expense.reporterId = report.reporterId;

            // The initial expense receives all the loot value
            const parsedExpense = parseExpense(expense);
            parsedExpense.balance = report.loot;

            winston.debug(`Start session time ${report.sessionStartTime}`);
            winston.debug(`Session duration ${report.sessionTime}`);
            winston.debug(`Session duration (MS) ${duration}`);

            const hunt = new Hunt();
            hunt.date = startTime;
            hunt.duration = duration;
            hunt.damage = report.damage;
            hunt.healing = report.healing;
            hunt.experience = report.xp;
            hunt.loot = report.loot;
            hunt.items = parseItems(report.lootItems);
            hunt.monsters = parseMonsters(report.monsters);
            hunt.expenses.push(parsedExpense);

            await hunt.save();
            winston.debug(`Hunt data stored with code ${hunt.code}`);
            return { code: hunt.code, pinCode: hunt.pinCode };
        } catch (err) {
            winston.error(`Unable to persist hunt: ${err}`);
            throw err;
        }
    }

    async persistPayment(payment) {
        winston.debug('Storing payment information.');

        try {
            const hunt = await Hunt.findOne({ code: payment.code, 'expenses.reporterId': payment.reporterId });

            if (hunt) {
                hunt.paid = true;
                await hunt.save();

                return true;
            } else {
                throw Error(`User ${payment.reporter} is not allowed to mark the hunt ${payment.code} as paid.`);
            }
        } catch (err) {
            winston.error(`Unable to mark hunt ${payment.code} as paid by ${payment.reporterId}: ${err}`);
            throw err;
        }
    }
}

module.exports = new Storer();
