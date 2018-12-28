'use strict';

class SingleHuntReportModel {
    constructor() {
		this.code;
		this.pinCode;
		this.date;
		this.experience;
		this.loot;
		this.paid;
		this.share;
		this.expenses;
		this.items = [];
		this.monsters = [];
		this.reporters = [];
    }
}

module.exports = SingleHuntReportModel;