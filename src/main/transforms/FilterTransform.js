import Transform from './Transform';
import PredicateCompiler from '../predicate/PredicateCompiler';

/**
 * Filters incoming events and selectively emits ones that match
 * the params.
 **/
export default class FilterTransform extends Transform {
  constructor(opts, config, logger) {
    super(opts, config, logger);

    this._predicate = PredicateCompiler.compile(this._opts.predicate);
  }

  process(event, eventId) {
    this._logger.info('Processing event %s.', eventId);

    if (this._predicate.test(event)) {
      return this.emit(event);
    } else {
      return this.emit(null);
    }
  }
}
