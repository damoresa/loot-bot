'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    discord_id: { type: String, required: true },
    discord_discriminator: { type: String, required: true },
    username: { type: String, required: true },
    access_token: { type: String, required: true },
    expires_in: { type: Number, required: true },
    refresh_token: { type: String, required: true },
    token_type: { type: String, required: true },
    token_scope: { type: String, required: true },
    token_source: { type: String, require: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
