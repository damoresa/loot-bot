'use strict';

class MonthBalanceModel {
    constructor() {
        this._expenses;
        this._loot;
    }

    get expenses() {
        return this._expenses;
    }

    set expenses(expenses) {
        this._expenses = expenses;
    }

    get loot() {
        return this._loot;
    }

    set loot(loot) {
        this._loot = loot;
    }
}

module.exports = MonthBalanceModel;
