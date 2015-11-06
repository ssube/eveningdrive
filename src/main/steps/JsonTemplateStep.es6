import Step from '../Step';

import handlebars from 'handlebars';

export default class JsonTemplateStep extends Step {
  constructor(options = {}) {
    super(options);
    this._template = handlebars.compile(options.template);
    this._logger.info('Spawned JSON template step.');
  }

  process(data) {
    return JSON.parse(this._template(data));
  }
}
