class MonthHuntModel {
    constructor() {
        this._code;
        this._date;
        this._participants = [];
    }

    get code() {
        return this._code;
    }

    set code(code) {
        this._code = code;
    }

    get date() {
        return this._date;
    }

    set date(date) {
        this._date = date;
    }

    get participants() {
        return this._participants;
    }

    set participants(participants) {
        this._participants = participants;
    }
}

module.exports = MonthHuntModel;