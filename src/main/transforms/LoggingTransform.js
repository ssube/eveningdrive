import bunyan from 'bunyan';

import Transform from './Transform';

export default class LoggingTransform extends Transform {
  constructor(opts) {
    super(opts);
  }

  process(event, eventId) {
    this._logger.info('Processing event %s.', eventId, {event});
    return this.emit(event);
  }
}
