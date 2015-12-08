import bunyan from 'bunyan';
import handlebars from 'handlebars';

import Transform from './Transform';

export default class HandlebarsTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._logger = bunyan.createLogger({name: `HandlebarsTransform-${this._id}`});
    this._template = handlebars.compile(this._opts.template);
  }

  process(event) {
    try {
      this._logger.debug('Rendering template with event data from %s.', event.id);
      const render = this._template(event.data);
      this._logger.debug('Parsing template output JSON from %s.', event.id);
      const output = JSON.parse(render);
      this._logger.debug('Emitting output event.');
      return this.emit(output);
    } catch (e) {
      this._logger.warn('Error rendering or parsing event: %s', e);
      return Promise.reject(e);
    }
  }
}
