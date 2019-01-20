'use strict';

class PaymentModel {
    constructor() {
        this._code;
        this._reporter;
        this._reporterId;
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

    get reporterId() {
        return this._reporterId;
    }

    set reporterId(reporterId) {
        this._reporterId = reporterId;
    }
}

module.exports = PaymentModel;
