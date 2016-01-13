import AndPredicate from './AndPredicate';
import EqPredicate from './EqPredicate';
import GtPredicate from './GtPredicate';
import GteqPredicate from './GteqPredicate';
import LtPredicate from './LtPredicate';
import LteqPredicate from './LteqPredicate';
import NeqPredicate from './NeqPredicate';
import OrPredicate from './OrPredicate';

export default class PredicateCompiler {
  static compile(opts) {
    let {type, sub = []} = opts;
    sub = sub.map(PredicateCompiler.compile);

    switch (type) {
      case 'and':
        return new AndPredicate({sub});
      case 'eq':
        return new EqPredicate(opts);
      case 'gt':
        return new GtPredicate(opts);
      case 'gteq':
        return new GteqPredicate(opts);
      case 'lt':
        return new LtPredicate(opts);
      case 'lteq':
        return new LteqPredicate(opts);
      case 'neq':
        return new NePredicate(opts);
      case 'or':
        return new OrPredicate({sub});
    }
  }
}
