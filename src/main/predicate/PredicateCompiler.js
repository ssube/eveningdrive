import AndPredicate from './AndPredicate';
import EqPredicate from './EqPredicate';
import GtPredicate from './GtPredicate';
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
      case 'or':
        return new OrPredicate({sub});
    }
  }
}
