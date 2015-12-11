import bunyan from 'bunyan';
import Promise from 'bluebird';

const logger = bunyan.createLogger({name: 'Transform'});

export default class Transform {
  static create(type, opts, config) {
    let constructor;
    switch (type) {
      case 'logging':
        constructor = require('./LoggingTransform').default;
        break;
      case 'noop':
        constructor = require('./NoopTransform').default;
        break;
      case 'path':
        constructor = require('./PathTransform').default;
        break;
      case 'request':
        constructor = require('./RequestTransform').default;
        break;
      case 'stats':
        constructor = require('./StatsTransform').default;
        break;
      case 'template':
        constructor = require('./TemplateTransform').default;
        break;
      default:
        logger.warn('Creating unknown transform type %s for transform %s.', type, opts.id);
        constructor = Transform;
    }

    return new constructor(opts, config);
  }

  constructor({id, inputs, opts}) {
    this._id = id;
    this._inputs = inputs;
    this._logger = bunyan.createLogger({name: `${this.constructor.name}-${this._id}`});
    this._opts = opts;
  }

  get id() {
    return this._id;
  }

  get inputs() {
    return this._inputs;
  }

  close() {
    // nop
  }

  /**
   * Return a promise that immediately resolves with output data.
   **/
  emit(data) {
    return Promise.resolve(data);
  }

  /**
   * Process a single incoming event and return a promise that will resolve when the
   * processing is complete (allowing for async requests during the transform).
   * If the promises resolves with some output data, that will be emitted as another
   * event with this transform as the source.
   **/
  process(event, eventId) {
    logger.warn(
      'Processing event %s from base transform interface (no processing will occur).', eventId
    );
    return this.emit(null);
  }
}
