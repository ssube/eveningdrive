import Transform from './Transform';
import Template from '../server/Template';

export default class TemplateTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._template = new Template(this._opts.template);
  }

  process(event) {
    const render = this._template.render(event);
    try {
      let output = JSON.parse(render);
      return this.emit(output);
    } catch (e) {
      this._logger.warn(e, 'Error rendering or parsing event: %s', render);
      return Promise.reject(e);
    }
  }
}
