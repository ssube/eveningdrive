import Transform from './Transform';

export default class NoopTransform extends Transform {
  constructor(opts) {
    super(opts);
  }

  process(event) {
    return this.emit(event);
  }
}
