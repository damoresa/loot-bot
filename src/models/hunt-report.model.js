class SingleHuntReportModel {
    constructor() {
		this.code;
		this.date;
		this.experience;
		this.loot;
		this.share;
		this.expenses;
		this.items = [];
		this.monsters = [];
		this.reporters = [];
    }
}

module.exports = SingleHuntReportModel;