import Transform from './Transform';
import Template from '../server/Template';

export default class TemplateTransform extends Transform {
  constructor(opts, config, logger) {
    super(opts, config, logger);
    
    this._template = this.getOption('template');
  }

  process(event) {
    const render = this._template.render(event);
    try {
      let output = JSON.parse(render);
      return this.emit(output);
    } catch (e) {
      this._logger.warn(e, 'Error rendering or parsing event: %s', render);
      return this.fail(e);
    }
  }
}
