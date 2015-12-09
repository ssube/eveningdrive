import bunyan from 'bunyan';
import Promise from 'bluebird';

const logger = bunyan.createLogger({name: 'Transform'});

export default class Transform {
  static create(type, opts) {
    switch (type) {
      case "logging":
        const LoggingTransform = require('./LoggingTransform').default;
        return new LoggingTransform(opts);
      case "noop":
        const NoopTransform = require('./NoopTransform').default;
        return new NoopTransform(opts);
      case "path":
        const PathTransform = require('./PathTransform').default;
        return new PathTransform(opts);
      case "request":
        const RequestTransform = require('./RequestTransform').default;
        return new RequestTransform(opts);
      case "template":
        const TemplateTransform = require('./TemplateTransform').default;
        return new TemplateTransform(opts);
      default:
        logger.warn('Creating unknown transform type %s for transform %s.', type, opts.id);
        return new Transform(opts);
    }
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

  emit(data) {
    return Promise.resolve(data);
  }

  process(event, eventId) {
    logger.warn(
      'Processing event %s from base transform interface (no processing will occur).', eventId
    );
    return Promise.resolve();
  }
}
