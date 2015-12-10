import bunyan from 'bunyan';
import fs from 'fs';
import handlebars from 'handlebars';
import jsonpath from 'JSONPath';

const logger = bunyan.createLogger({name: 'Template'});

export default class Template {
  /**
   * Works around a problem in handlebars, where helpers have to be registered
   * at a global level.
   **/
  static registerHelpers(config) {
    handlebars.registerHelper('path', (path, data) => {
      logger.debug('Executing template path helper.', path, data);
      return JSON.stringify(jsonpath.eval(data, path));
    });

    handlebars.registerHelper('conf', (key) => {
      const value = config.params[key];
      logger.debug('Executing template conf helper.', key, value);
      return value;
    });
  }

  static loadTemplate(string) {
    const prefix = 'file://';
    if (string.indexOf(prefix) === 0) {
      const filename = string.substr(prefix.length);
      logger.debug('Loading template from file %s.', filename);
      return fs.readFileSync(filename, 'utf8');
    } else {
      return string;
    }
  }

  constructor(string) {
    this._string = Template.loadTemplate(string);
    logger.info('Creating template from %s.', typeof this._string, this._string);
    this._template = handlebars.compile(this._string);
  }

  render(data) {
    return this._template(data);
  }
}
