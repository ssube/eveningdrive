import Step from '../Step';
import Walker from '../utils/Walker';

import handlebars from 'handlebars';

const templateTransforms = {
  string: (it) => handlebars.compile(it),
};


export default class TemplateStep extends Step {
  constructor(options = {}) {
    super(options);
    this._template = Walker.iterate(options.template, templateTransforms);
  }

  process(data) {
    const processTransforms = {
      function: (it) => it(data),
    };

    return Walker.iterate(this._template, processTransforms);
  }
}
