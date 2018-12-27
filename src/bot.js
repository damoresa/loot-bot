'use strict';

const Discord = require('discord.js');
const winston = require('winston');

const CONSTANTS = require('./constants/constants');
const Parser = require('./parser');
const Service = require('./service');

// TODO Use an EventEmitter to notify the loader about the status
const launchDiscordBot = () => {
    // Initialize Discord Bot
    winston.info('Configuring client');
    const client = new Discord.Client();

    client.on('ready', () => {
        winston.info(`Connected to Discord as ${client.user.username}.`);
        client.user.setPresence({game: {name: 'Tibia', type: 0}});
    });

    client.on('message', async (message) => {
        if (message.author.username !== CONSTANTS.BOT_NAME && message.content.startsWith('!')) {
            if (CONSTANTS.COMMANDS_REGEXP.HELP.test(message.content)) {

                // TODO: Use Markdown - https://support.discordapp.com/hc/es/articles/210298617-Markdown-de-texto-b%C3%A1sico-Formato-de-Chat-Negrilla-It%C3%A1lico-Subrayado-
                let response = `The following commands are available:\n`;
                response += ` - !loot LOOTPASTE : records the given loot data on the database. A reply with the hunt code is generated aswell.\n`;
                response += ` - !expense HUNTCODE AMOUNT PINCODE : records the given supplies expense to the hunt with the given code and pin code. Your Discord user is used to keep track of who reported the expense.\n`;
                response += ` - !balance HUNTCODE : displays the money balance for the given hunt code aswell as who reported expenses.\n`;
                response += ` - !monthxp : displays the amount of experience obtained by the user executing the command.\n`;
                response += ` - !monthhunts : displays the recorded hunts during this month with participants.\n`;
                response += ` - !monthbalance : displays the recorded balance generated by combining all your hunts during this month.\n`;
                response += `\n`;
                response += `Possible TODO list:\n`;
                response += ` - !monsters HUNTCODE : displays the monsters slain on for the given hunt code.\n`;

                try {
                    const username = await Parser.parseHelp(message.content);
                    if (username) {
                        message.channel.send(`${username}, ${response}`);
                    } else {
                        message.reply(response);
                    }
                } catch (err) {
                    winston.error(`Unable to generate help message: ${err}`);
                    message.reply(`Something went wrong, please contact an administrator.`);
                }
            } else if (CONSTANTS.COMMANDS_REGEXP.LOOT.test(message.content)) {
                try {
                    const lootReport = await Parser.parseLoot(message.author.username, message.content);
                    const output = await Service.saveLoot(lootReport);

                    let response = `You hunted for ${output.sessionTime} hours:\n`;
                    response += ` - Experience: ${output.xp}\n`;
                    response += ` - Loot value: ${output.loot}\n`;
                    response += ` - Monster kills:\n`;
                    for (const monster of output.monsters) {
                        response += `   * ${monster.amount} ${monster.name}\n`;
                    }
                    // The code will only be useful for stored parses
                    if (output.code) {
                        response += `\n`;
                        response += `This hunt has been given the code ${output.code}. If you wish to add expenses to it, use the !expense command.`;
                    }

                    const reporterMessage = `The pincode for your hunt ${output.code} is ${output.pinCode}.\nRemember to keep this code private to your party members.`;

                    message.reply(response);
                    const reporterChannel = await message.author.createDM();
                    reporterChannel.send(reporterMessage);
                } catch (err) {
                    winston.error(`Unable to store hunt report for user ${message.author.username}: ${err}`);
                    message.reply('Unable to store hunt report.');
                }
            } else if (CONSTANTS.COMMANDS_REGEXP.EXPENSE.test(message.content)) {
                try {
                    const expenseReport = await Parser.parseExpense(message.author.username, message.author.id, message.content);
                    const output = await Service.saveExpense(expenseReport);

                    const response = `Expense of ${output.amount} registered for hunt ${output.code} by ${output.reporter}.`;
                    message.reply(response);
                } catch (err) {
                    winston.error(`Unable to store expense for user ${message.author.username}: ${err}`);
                    message.reply('Unable to store expense, please remember to input the correct pin code.\nIf you don\'t have one, ask the hunt reporter for it.');
                }
            } else if (CONSTANTS.COMMANDS_REGEXP.BALANCE.test(message.content)) {
                try {
                    const huntCode = await Parser.parseBalance(message.content);
                    const balance = await Service.calculateBalance(huntCode);

                    let response = `The hunt with code ${balance.code} has registered the following data:\n`;
                    response += ` - Loot value: ${balance.loot}\n`;
                    response += ` - Expenses value: ${balance.expenses}\n`;
                    response += `\n`;
                    response += `The overall balance is ${balance.loot - balance.expenses}.\n`;
                    response += `\n`;
                    response += `The share per reporter is as follows:\n`;
                    for (const share of balance.balances) {
                        response += ` - ${share.reporter}: ${share.balance} (${share.balance - share.amount} balance)\n`;
                    }

                    message.reply(response);
                } catch (err) {
                    winston.error(`Unable to generate balance for user ${message.author.username}: ${err}`);
                    message.reply('Unable to generate balance for the requested hunt code.');
                }
            } else if (CONSTANTS.COMMANDS_REGEXP.MONTHXP.test(message.content)) {
                try {
                    const output = await Service.calculateMonthExp(message.author.id);

                    let response;
                    if (output === 0) {
                        response = 'You haven\'t earned any experience this month.';
                    } else {
                        response = `You've obtained ${output} experience this month.\n`;
                        response += `NOTE: Keep in mind deaths are not being tracked, so experience losses are not accounted.`;
                    }

                    message.reply(response);
                } catch (err) {
                    winston.error(`Unable to generate monthly experience report for user ${message.author.username}: ${err}`);
                    message.reply('Unable to generate monthly experience report.');
                }
            } else if (CONSTANTS.COMMANDS_REGEXP.MONTHHUNTS.test(message.content)) {
                try {
                    const output = await Service.retrieveMonthHunts();

                    let response;
                    if (output.length === 0) {
                        response = 'You haven\'t participated on any hunt this month.';
                    } else {
                        response = `The following hunts have been recorded this month:\n`;
                        output.forEach((hunt) => {
                            response += ` - Hunt ${hunt.code} happened on ${hunt.date}.\n`;
                            response += `   The following players participated in the hunt:\n`;
                            hunt.participants.forEach((participant) => {
                                response += `    * ${participant}\n`;
                            });
                            response += `\n`;
                        });
                    }

                    message.reply(response);
                } catch (err) {
                    winston.error(`Unable to generate this month's hunts report for user ${message.author.username}: ${err}`);
                    message.reply('Unable to generate this month\'s hunts report.');
                }
            } else if (CONSTANTS.COMMANDS_REGEXP.MONTHBALANCE.test(message.content)) {
                try {
                    const output = await Service.calculateMonthBalance(message.author.id);

                    let response;
                    if (output.expenses === 0 && output.loot === 0) {
                        response = 'You haven\'t earned or spent anything this month.';
                    } else {
                        response = `You've spent ${output.expenses} supplies and your hunts have generated ${output.loot} split loot.`;
                    }

                    message.reply(response);
                } catch (err) {
                    winston.error(`Unable to generate this month's hunts balance report for user ${message.author.username}: ${err}`);
                    message.reply('Unable to generate this month\'s hunts balance report.');
                }
            } else {
                winston.error(`${message.author.username} tried to use the command ${message.content}`);
                message.reply(`Unknown or wrong frommated command, please try !help to learn about the available commands.`);
            }
        }
    });

    winston.info('Connecting to Discord');
    client.login(CONSTANTS.DISCORD.BOT_AUTH_TOKEN);
};

module.exports = launchDiscordBot;