const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    items: [itemSchema],
    monsters: [monsterSchema],
    expenses: [expenseSchema]
});

const Hunt = mongoose.model('Hunt', huntSchema);
module.exports = Hunt;