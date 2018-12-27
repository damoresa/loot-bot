'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const {generateRandomPinCode} = require('./../utils/common.functions');
const CONSTANTS = require('./../constants/constants');

const expenseSchema = mongoose.model('Expense').schema;
const itemSchema = mongoose.model('Item').schema;
const monsterSchema = mongoose.model('Monster').schema;

const huntSchema = new Schema({
    code: {type: String, required: true},
    name: {type: String, required: false},
    date: {type: Date, required: true},
    duration: {type: Number, required: true},
    damage: {type: Number, required: true},
    healing: {type: Number, required: true},
    experience: {type: Number, required: true},
    loot: {type: Number, required: true},
    pinCode: {type: String, required: true},
    items: [itemSchema],
    monsters: [monsterSchema],
    expenses: [expenseSchema]
});

// Generate a pin code for the hunt before persisting it
// This has to be done before validation happens since the pinCode is required
huntSchema.pre('validate', function () {
    if (this.isNew) {
        this.pinCode = generateRandomPinCode(CONSTANTS.PINCODE_LENGTH);
    }
});

const Hunt = mongoose.model('Hunt', huntSchema);
module.exports = Hunt;
