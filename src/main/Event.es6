import EventInfo from './EventInfo';

export default class Event {
  constructor(info, data) {
    this._info = new EventInfo(info);
    this._data = data;
  }

  get info() {
    return this._info;
  }

  get data() {
    return this._data;
  }

  serialize() {
    return JSON.stringify(this);
  }
}
