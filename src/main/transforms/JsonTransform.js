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
    const output = Object.keys(this._opts).reduce((p, key) => {
      p[key] = jsonpath.eval(event.data, this._opts[key]);
    }, {});
    this._logger.debug('Processed event to: %s', output);
    return this.emit(output);
  }
}
