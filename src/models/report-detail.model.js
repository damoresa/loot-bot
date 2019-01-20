'use strict';

class ReportDetailModel {
    constructor() {
        this._amount;
        this._name;
    }

    get amount() {
        return this._amount;
    }

    set amount(amount) {
        this._amount = amount;
    }

    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }
}

module.exports = ReportDetailModel;
