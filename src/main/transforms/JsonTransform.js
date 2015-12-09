import bunyan from 'bunyan';
import jsonpath from 'JSONPath';
import Promise from 'bluebird';

import Transform from './Transform';

export default class JsonTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._logger = bunyan.createLogger({name: `JsonTransform-${this._id}`});
  }

  process(event) {
    this._logger.info('Received event %s.', event.id);
    const output = Object.keys(this._opts).reduce((p, key) => {
      p[key] = jsonpath.eval(event.data, this._opts[key]);
      return p;
    }, {});
    this._logger.info('Processed event %s to: %s', event.id, output);
    return this.emit(output);
  }
}
