import Log from './Log';

export default class Step {
  constructor(options = {}) {
    this._field = options.field;
    this._id = options.id;
    this._last = options.last;
    this._logger = new Log();
  }

  get id() {
    return this._id;
  }

  get last() {
    return this._last;
  }

  accept(event) {
    return event.info.source !== this.id;
  }

  process(data) {
    return data[this._field];
  }

  serialize() {
    return JSON.stringify(this);
  }
}
