import Promise from 'bluebird';

import Transform from './Transform';

export default class JsonTransform extends Transform {
  constructor(opts) {
    super(opts);
  }

  process(event) {
    return Promise.resolve(Object.keys(this._opts).reduce((p, key) => {
      p[key] = event[this._opts[key]];
    }, {}));
  }
}
