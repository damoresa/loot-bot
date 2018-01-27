const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const monsterSchema = new Schema({
    amount: {type: Number, required: true},
    name: {type: String, required: true},
});

const Monster = mongoose.model('Monster', monsterSchema);
module.exports = Monster;