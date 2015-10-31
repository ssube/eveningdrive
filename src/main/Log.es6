export default class Log {
  constructor(clazz) {
    this._clazz = clazz;
  }

  debug(msg, ...params) {
    console.log(this._clazz, msg, params);
  }

  info(msg, ...params) {
    console.log(this._clazz, msg, params);
  }

  warn(msg, ...params) {
    console.warn(this._clazz, msg, params);
  }

  error(msg, ...params) {
    console.error(this._clazz, msg, params);
  }
}
