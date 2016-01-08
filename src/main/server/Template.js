import fs from 'fs';
import handlebars from 'handlebars';
import jsonpath from 'JSONPath';

let _logger;
let _rootPath = process.cwd();

export default class Template {
  static lookup(data, path, single) {
    const results = jsonpath.eval(data, path);
    let value = single ? results[0] : results;
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return value;
  }

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

    handlebars.registerHelper('safe', (string) => {
      _logger.debug('Executing template safe helper.', {string});
      return string.replace('\n', '\\n');
    });

    handlebars.registerHelper('clone', (data) => {
      _logger.debug('Executing template clone helper.', {data});
      return new handlebars.SafeString(JSON.stringify(data));
    });

    handlebars.registerHelper('path', (path, data, single = true) => {
      const value = Template.lookup(data, path, single);
      _logger.debug('Executing template path helper.', {path, value, data, single});
      return new handlebars.SafeString(value);
    });

    handlebars.registerHelper('shared', (path, single = true) => {
      const value = Template.lookup(config.shared, path, single);
      _logger.debug('Executing template shared helper.', {path, value});
      return new handlebars.SafeString(value);
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
