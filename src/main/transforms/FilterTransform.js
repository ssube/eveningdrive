import Transform from './Transform';

/**
 * Filters incoming events and selectively emits ones that match
 * the params.
 *
 * @TODO: add support for nested conditions, AND/OR
 **/
export default class FilterTransform extends Transform {
  constructor(opts) {
    super(opts);

    this._value = this.getOption('value');
    this._expected = this.getOption('expected');
    this._operator = this.getOption('operator');
  }

  test(a, op, b) {
    switch (op) {
      case '==':
        return (a == b);
      case '!=':
        return (a != b);
      case '>':
        return (a > b);
      case '>=':
        return (a >= b);
      case '<':
        return (a < b);
      case '<=':
        return (a <= b);
      default:
        this._logger.warn('Unknown operator %s.', op);
        return false;
    }
  }

  process(event, eventId) {
    const value = this._value.render(event);
    const expected = this._expected.render(event);
    const operator = this._operator.render(event);

    this._logger.info('Processing event %s.', eventId, {
      value, operator, expected
    });

    const results = this.test(value, operator, expected);

    if (results) {
      return this.emit(event);
    } else {
      return this.emit(null);
    }
  }
}
