import Promise from 'bluebird';
import logger from 'winston';

export default class Transform {
  constructor(opts) {
    this._opts = opts;
  }

  process(event) {
    logger.warn('Processing event from base transform interface (no processing will occur).');
    return Promise.resolve();
  }
}
