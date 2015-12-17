import bunyan from 'bunyan';

import Queue from './Queue';

const logger = bunyan.createLogger({name: 'Config'});

// TODO: break this class down (it's a connection pool for multiple tools, not config)
export default class Config {
  static loadFrom(path) {
    const data = require(path);
    return new Config(data);
  }

  constructor(data) {
    this._data = data;
  }

  get event() {
    return this._data.event;
  }

  get log() {
    return this._data.log;
  }

  get redis() {
    return this._data.redis;
  }

  get server() {
    return this._data.server;
  }

  get shared() {
    return this._data.shared;
  }

  get statsd() {
    return this._data.statsd;
  }

  get transform() {
    return this._data.transform;
  }

  get worker() {
    return this._data.worker;
  }
}
