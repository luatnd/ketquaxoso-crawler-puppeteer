class PlayResult {
  constructor() {
    this._dayPlayed = 0;
    this._totalCost = 0;
    this._totalWin = 0;
    this._balance = 0;
    this._balancePercent = 0;
  }

  get dayPlayed() {
    return this._dayPlayed;
  }

  get totalCost() {
    return this._totalCost;
  }

  set dayPlayed(val) {
    this._dayPlayed = val;
  }

  set totalCost(val) {
    this._totalCost = val;
    this.recalculateBalance();
  }

  get totalWin() {
    return this._totalWin;
  }

  set totalWin(val) {
    this._totalWin = val;
    this.recalculateBalance();
  }

  get balance() {
    return this._balance;
  }

  get balancePercent() {
    return this._balancePercent + '%';
  }

  recalculateBalance() {
    this._balance = this.totalWin - this.totalCost;
    this._balancePercent = Math.round(this.balance / this.totalCost * 100);
  }
}

module.exports = PlayResult;