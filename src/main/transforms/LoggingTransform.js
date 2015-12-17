import Transform from './Transform';

export default class LoggingTransform extends Transform {
  constructor(opts, config, logger) {
    super(opts, config, logger);
  }

  process(event, eventId) {
    this._logger.info('Processing event %s.', eventId, {event});
    return this.emit(event);
  }
}
