import bunyan from 'bunyan';
import Promise from 'bluebird';

import Transform from './Transform';

export default class LoggingTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._logger = bunyan.createLogger({name: `LoggingTransform-${this._id}`});
  }

  process(event) {
    this._logger.info('Processing event.', {event});
    return this.emit(event.data);
  }
}
