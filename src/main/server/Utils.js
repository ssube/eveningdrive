export default class Utils {
  static flatten(arrays) {
    return arrays.reduce((p, c) => p.concat(c), []);
  }

  static compact(array) {
    return array.filter(it => it !== null);
  }
}
