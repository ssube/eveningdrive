import Predicate from './Predicate';

export default class OrPredicate extends Predicate {
  constructor(opts) {
    super(opts);
  }

  test(data) {
    return this._sub.some(child => child.test(data));
  }
}
