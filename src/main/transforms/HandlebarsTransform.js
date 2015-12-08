import handlebars from 'handlebars';

import Transform from './Transform';

export default class HandlebarsTransform extends Transform {
  constructor(opts) {
    super(opts);

    this._template = handlebars.compile(opts.template);
  }

  process(event) {
    try {
      const render = this._template(event);
      return Promise.resolve(JSON.parse(render));
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
