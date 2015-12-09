import bunyan from 'bunyan';
import handlebars from 'handlebars';
import jsonpath from 'JSONPath';

export default class TemplateString {
  /**
   * Works around a problem in handlebars, where helpers have to be registered
   * at a global level.
   **/
  static registerHelpers(config) {
    handlebars.registerHelper('path', (path, data) => {
      return jsonpath.eval(data, path);
    });

    handlebars.registerHelper('conf', (key) => {
      return config.params[key];
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
