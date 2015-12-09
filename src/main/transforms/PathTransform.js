import jsonpath from 'JSONPath';
import Promise from 'bluebird';

import Transform from './Transform';

export default class PathTransform extends Transform {
  constructor(opts) {
    super(opts);
  }

  process(event) {
    const output = Object.keys(this._opts).reduce((p, key) => {
      p[key] = jsonpath.eval(event, this._opts[key]);
      return p;
    }, {});
    
    return this.emit(output);
  }
}
