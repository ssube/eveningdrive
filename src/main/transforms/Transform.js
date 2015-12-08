import bunyan from 'bunyan';
import Promise from 'bluebird';

const logger = bunyan.createLogger({name: 'Transform'});

export default class Transform {
  constructor({id, inputs, opts}) {
    this._id = id;
    this._inputs = inputs;
    this._opts = opts;
  }

  get id() {
    return this._id;
  }

  get inputs() {
    return this._inputs;
  }

  emit(data) {
    return Promise.resolve({id: Date.now(), data});
  }

  process(event) {
    logger.warn('Processing event from base transform interface (no processing will occur).');
    return Promise.resolve();
  }
}
