export default class Config {
  constructor(path = './config') {
    this._data = require(path);
  }

  get data() {
    return this._data;
  }
}
