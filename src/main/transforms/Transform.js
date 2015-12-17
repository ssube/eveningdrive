import Promise from 'bluebird';

import Template from '../server/Template';

export default class Transform {
  static create(type, opts, config, logger) {
    let constructor;
    switch (type) {
      case 'filter':
        constructor = require('./FilterTransform').default;
        break;
      case 'logging':
        constructor = require('./LoggingTransform').default;
        break;
      case 'path':
        constructor = require('./PathTransform').default;
        break;
      case 'request':
        constructor = require('./RequestTransform').default;
        break;
      case 'slack':
        constructor = require('./SlackTransform').default;
        break;
      case 'stats':
        constructor = require('./StatsTransform').default;
        break;
      case 'template':
        constructor = require('./TemplateTransform').default;
        break;
      default:
        constructor = Transform;
        break;
    }

    return new constructor(opts, config, logger);
  }

  constructor({comment, id, inputs, opts}, config, logger) {
    this._comment = comment;
    this._id = id;
    this._inputs = inputs;
    this._logger = logger.child({class: this.constructor.name, id});
    this._opts = opts;
  }

  get comment() {
    return this._comment;
  }

  get id() {
    return this._id;
  }

  get inputs() {
    return this._inputs;
  }

  getOption(name, defaultValue = '') {
    return new Template(this._opts[name] || defaultValue);
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
   * Return a promise that immediately fails with the supplied error.
   **/
  fail(err) {
    return Promise.reject(err);
  }

  /**
   * Process a single incoming event and return a promise that will resolve when the
   * processing is complete (allowing for async requests during the transform).
   * If the promises resolves with some output data, that will be emitted as another
   * event with this transform as the source.
   **/
  process(event, eventId) {
    this._logger.warn(
      'Processing event %s from base transform interface (no processing will occur).', eventId
    );
    return this.emit(null);
  }
}
