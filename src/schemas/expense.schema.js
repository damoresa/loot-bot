'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    amount: {type: Number, required: true},
    balance: {type: Number, required: true},
    reporter: {type: String, required: true},
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;