import bunyan from 'bunyan';
import handlebars from 'handlebars';
import jsonpath from 'JSONPath';

const logger = bunyan.createLogger({name: 'TemplateString'});

export default class TemplateString {
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

  constructor(string) {
    this._string = string;
    this._template = handlebars.compile(string);
  }

  render(data) {
    return this._template(data);
  }
}
