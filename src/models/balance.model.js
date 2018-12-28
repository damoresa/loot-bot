'use strict';

class BalanceModel {
    constructor() {
        this._code;
        this._loot;
        this._balances = [];
		this._expenses;
    }

    get code() {
        return this._code;
    }

    set code(code) {
        this._code = code;
    }

    get loot() {
        return this._loot;
    }

    set loot(loot) {
        this._loot = loot;
    }

    get balances() {
        return this._balances;
    }

    set balances(balances) {
        this._balances = balances;
    }

    get expenses() {
        return this._expenses;
    }

    set expenses(expenses) {
        this._expenses = expenses;
    }
}

module.exports = BalanceModel;