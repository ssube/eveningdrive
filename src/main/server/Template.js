import fs from 'fs';
import handlebars from 'handlebars';

import Helpers from '../helpers/Helpers';

let _logger;
let _rootPath = process.cwd();

export default class Template {
  static registerHelpers(config, logger, rootPath = null) {
    _logger = logger.child({class: 'Template'});
    _logger.info('Registering template helpers with root path %s.', rootPath);

    if (rootPath) {
      _rootPath = rootPath;
    }

    Helpers(config, handlebars, logger);
  }

  static parsePath(path) {
    return path.replace('${root}', _rootPath);
  }

  static loadTemplate(string) {
    const prefix = 'file://';
    if (string.indexOf(prefix) === 0) {
      const filename = Template.parsePath(string.substr(prefix.length));
      _logger.debug('Loading template from file %s.', filename);
      return fs.readFileSync(filename, 'utf8');
    } else {
      _logger.debug('Compiling template from string.', {string});
      return string;
    }
  }

  constructor(string) {
    this._string = Template.loadTemplate(string);
    this._template = handlebars.compile(this._string);
  }

  render(data) {
    return this._template(data);
  }
}
