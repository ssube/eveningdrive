import Promise from 'bluebird';

import Transform from './Transform';

export default class JsonTransform extends Transform {
  constructor(opts) {
    super(opts);
  }

  process(event) {
    const output = Object.keys(this._opts).reduce((p, key) => {
      p[key] = event.data[this._opts[key]];
    }, {});
    return this.emit(output);
  }
}
