'use strict';

class ExpenseModel {
    constructor() {
        this._amount;
        this._code;
        this._reporter;
    }

    get amount() {
        return this._amount;
    }

    set amount(amount) {
        this._amount = amount;
    }

    get code() {
        return this._code;
    }

    set code(code) {
        this._code = code;
    }

    get reporter() {
        return this._reporter;
    }

    set reporter(reporter) {
        this._reporter = reporter;
    }
}

module.exports = ExpenseModel;