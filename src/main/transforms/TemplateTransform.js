import Transform from './Transform';
import TemplateString from '../server/TemplateString';

export default class TemplateTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._template = new TemplateString(this._opts.template);
  }

  process(event) {
    const render = this._template.render(event);
    try {
      const output = JSON.parse(render);
      return this.emit(output);
    } catch (e) {
      this._logger.warn('Error rendering or parsing event: %s', e, render);
      return Promise.reject(e);
    }
  }
}
