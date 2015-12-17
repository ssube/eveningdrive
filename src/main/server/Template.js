import fs from 'fs';
import handlebars from 'handlebars';
import jsonpath from 'JSONPath';

let _logger;
let _rootPath = process.cwd();

export default class Template {
  /**
   * Works around a problem in handlebars, where helpers have to be registered
   * at a global level.
   **/
  static registerHelpers(config, logger, rootPath = null) {
    _logger = logger.child({class: 'Template'});
    _logger.info('Registering template helpers with root path %s.', rootPath);

    if (rootPath) {
      _rootPath = rootPath;
    }

    handlebars.registerHelper('path', (path, data) => {
      _logger.debug('Executing template path helper.', path, data);
      return JSON.stringify(jsonpath.eval(data, path));
    });

    handlebars.registerHelper('shared', (path) => {
      const value = jsonpath.eval(config.shared, path);
      _logger.debug('Executing template conf helper.', {path, value, shared: config.shared});
      return value;
    });
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
