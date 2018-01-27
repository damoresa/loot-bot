class ReportModel {
    constructor() {
        this._code;
        this._damage;
        this._healing;
        this._loot;
        this._lootItems = [];
        this._monsters = [];
        this._reporter;
        this._sessionEndTime;
        this._sessionStartTime;
        this._sessionTime;
        this._supplies;
        this._xp;
    }

    get code() {
        return this._code;
    }

    set code(code) {
        this._code = code;
    }

    get damage() {
        return this._damage;
    }

    set damage(damage) {
        this._damage = damage;
    }

    get healing() {
        return this._healing;
    }

    set healing(healing) {
        this._healing = healing;
    }

    get loot() {
        return this._loot;
    }

    set loot(loot) {
        this._loot = loot;
    }

    get lootItems() {
        return this._lootItems;
    }

    get monsters() {
        return this._monsters;
    }

    get reporter() {
        return this._reporter;
    }

    set reporter(reporter) {
        this._reporter = reporter;
    }

    get sessionEndTime() {
        return this._sessionEndTime;
    }

    set sessionEndTime(sessionEndTime) {
        this._sessionEndTime = sessionEndTime;
    }

    get sessionStartTime() {
        return this._sessionStartTime;
    }

    set sessionStartTime(sessionStartTime) {
        this._sessionStartTime = sessionStartTime;
    }

    get sessionTime() {
        return this._sessionTime;
    }

    set sessionTime(sessionTime) {
        this._sessionTime = sessionTime;
    }

    get supplies() {
        return this._supplies;
    }

    set supplies(supplies) {
        this._supplies = supplies;
    }

    get xp() {
        return this._xp;
    }

    set xp(xp) {
        this._xp = xp;
    }

    addLootItem(item) {
        if (!this._lootItems) {
            this._lootItems = [];
        }
        this._lootItems.push(item);
    }

    addMonster(monster) {
        if (!this._monsters) {
            this._monsters = [];
        }
        this._monsters.push(monster);
    }
}

module.exports = ReportModel;