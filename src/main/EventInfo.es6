class EventInfo {
  constructor(options = {}) {
    this._id = options.id;
    this._source = options.source;
  }

  get id() {
    return this._id;
  }

  get source() {
    return this._source;
  }
}
