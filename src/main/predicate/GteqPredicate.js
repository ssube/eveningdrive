import Predicate from './Predicate';
import Template from '../server/Template';

export default class GteqPredicate extends Predicate {
  constructor(opts) {
    const {lh, rh} = opts;

    super(opts);

    this._lh = new Template(lh);
    this._rh = new Template(rh);
  }

  test(data) {
    const lh = this._lh.render(data), rh = this._rh.render(data);
    return lh >= rh;
  }
}
