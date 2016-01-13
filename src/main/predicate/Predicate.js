export default class Predicate {
  constructor({sub = []} = opts) {
    this._sub = sub;
  }

  test(data) {
    return true;
  }
}
