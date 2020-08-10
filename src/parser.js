'use strict';

const winston = require('winston');

const CONSTANTS = require('./constants/constants');
const MODE = require('./constants/mode.enum');

const ExpenseModel = require('./models/expense.model');
const PaymentModel = require('./models/payment.model');
const ReportDetailModel = require('./models/report-detail.model');
const ReportModel = require('./models/report.model');

class Parser {
    constructor() {
        // Discord bot
        this.parseBalance.bind(this);
        this.parseExpense.bind(this);
        this.parseHelp.bind(this);
        this.parseLoot.bind(this);
        this.parsePayment.bind(this);

        // Web
        this.parseWebExpense.bind(this);
        this.parseWebLoot.bind(this);
        this.parseWebPayment.bind(this);

        // Internals
        this._parseExpenseContent.bind(this);
        this._parseLootContent.bind(this);
        this._parseLine.bind(this);
        this._parsePaymentContent.bind(this);
    }

    async parseBalance(content) {
        const match = CONSTANTS.COMMANDS_REGEXP.BALANCE.exec(content);
        if (match) {
            return match[1];
        } else {
            throw new Error(`Unable to parse balance from input ${content}`);
        }
    }

    async parseExpense(reporter, reporterId, content) {
        const match = CONSTANTS.COMMANDS_REGEXP.EXPENSE.exec(content);
        if (match) {
            return this._parseExpenseContent(reporter, reporterId, match[1], match[2], match[3]);
        } else {
            throw new Error(`Unable to parse expense from input ${content}`);
        }
    }

    async parseHelp(content) {
        const match = CONSTANTS.COMMANDS_REGEXP.HELP.exec(content);
        if (match) {
            let username = undefined;
            if (match.length === 3) {
                username = match[2];
            }

            return username;
        } else {
            throw new Error(`Unable to parse help from input ${content}`);
        }
    }

    async parseLoot(reporter, reporterId, content) {
        const match = CONSTANTS.COMMANDS_REGEXP.LOOT.exec(content);
        if (match) {
            const lootData = match[1];

            return this._parseLootContent(reporter, reporterId, lootData);
        } else {
            throw new Error(`Unable to parse expense from input ${content}`);
        }
    }

    async parsePayment(reporter, reporterId, content) {
        const match = CONSTANTS.COMMANDS_REGEXP.PAY.exec(content);
        if (match) {
            return this._parsePaymentContent(reporter, reporterId, match[1]);
        } else {
            throw new Error(`Unable to parse payment from input ${content}`);
        }
    }

    async parseWebExpense(reporter, reporterId, huntCode, expenseData, pinCode) {
        return this._parseExpenseContent(reporter, reporterId, huntCode, expenseData, pinCode);
    }

    async parseWebLoot(reporter, reporterId, content) {
        return this._parseLootContent(reporter, reporterId, content);
    }

    async parseWebPayment(reporter, reporterId, huntCode) {
        return this._parsePaymentContent(reporter, reporterId, huntCode);
    }

    _parseExpenseContent(reporter, reporterId, huntCode, expenseAmount, pinCode) {
        const expense = new ExpenseModel();
        expense.amount = expenseAmount;
        expense.code = huntCode;
        expense.pinCode = pinCode;
        expense.reporter = reporter;
        expense.reporterId = reporterId;

        return expense;
    }

    _parseLootContent(reporter, reporterId, content) {
        const splitData = content.split('\n');

        const report = new ReportModel();
        report.reporter = reporter;
        report.reporterId = reporterId;
        let mode = MODE.GENERAL;

        winston.info('Processing general info');

        for (const line of splitData) {
            // If it's any of the special lines, process them.
            // Do the usual procedure otherwise
            if (CONSTANTS.DATA_REGEXP.LOOT_ITEMS.exec(line)) {
                winston.info('Processing loot info');
                mode = MODE.ITEMS;
            } else if (CONSTANTS.DATA_REGEXP.MONSTERS.exec(line)) {
                winston.info('Processing monster kills info');
                mode = MODE.MONSTERS;
            } else {
                this._parseLine(mode, line, report);
            }
        }

        return report;
    }

    _parseLine(mode, line, report) {
        switch (mode) {
            case MODE.GENERAL: {
                const damage = CONSTANTS.DATA_REGEXP.DAMAGE.exec(line);
                const healing = CONSTANTS.DATA_REGEXP.HEALING.exec(line);
                const loot = CONSTANTS.DATA_REGEXP.LOOT.exec(line);
                const sessionData = CONSTANTS.DATA_REGEXP.SESSION_DATA.exec(line);
                const sessionTime = CONSTANTS.DATA_REGEXP.SESSION_TIME.exec(line);
                const supplies = CONSTANTS.DATA_REGEXP.SUPPLIES.exec(line);
                const xp = CONSTANTS.DATA_REGEXP.XP.exec(line);

                if (damage) {
                    report.damage = damage[1].replace(/,/g, '');
                }

                if (healing) {
                    report.healing = healing[1].replace(/,/g, '');
                }

                if (loot) {
                    report.loot = loot[1].replace(/,/g, '');
                }

                if (sessionData) {
                    report.sessionStartTime = sessionData[1].replace(/,/g, '');
                    report.sessionEndTime = sessionData[2].replace(/,/g, '');
                }

                if (sessionTime) {
                    report.sessionTime = sessionTime[1];
                }

                if (supplies) {
                    report.supplies = supplies[1].replace(/,/g, '');
                }

                if (xp) {
                    report.xp = xp[1].replace(/,/g, '');
                }

                break;
            }
            case MODE.ITEMS: {
                const itemDetail = CONSTANTS.DATA_REGEXP.DETAIL_ENTRY.exec(line);

                // Fixes a bug where no loot reports would silently crash.
                if (itemDetail[1] !== 'None') {
                    const itemData = new ReportDetailModel();
                    itemData.amount = itemDetail[2];
                    itemData.name = itemDetail[3];

                    report.addLootItem(itemData);
                }

                break;
            }
            case MODE.MONSTERS: {
                const monsterDetail = CONSTANTS.DATA_REGEXP.DETAIL_ENTRY.exec(line);

                // Fixes a bug where no monsters reports would silently crash.
                if (monsterDetail[1] !== 'None') {
                    const monsterData = new ReportDetailModel();
                    monsterData.amount = monsterDetail[2];
                    monsterData.name = monsterDetail[3];

                    report.addMonster(monsterData);
                }

                break;
            }
            default: {
                throw new Error('Unsupported mode');
            }
        }
    }

    _parsePaymentContent(reporter, reporterId, huntCode) {
        const payment = new PaymentModel();
        payment.code = huntCode;
        payment.reporter = reporter;
        payment.reporterId = reporterId;

        return payment;
    }
}

module.exports = new Parser();
