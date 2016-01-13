import jsonpath from 'JSONPath';

export default class Utils {
  static flatten(arrays) {
    return arrays.reduce((p, c) => p.concat(c), []);
  }

  static compact(array) {
    return array.filter(it => it !== null);
  }

  static lookup(data, path, single) {
    const results = jsonpath.eval(data, path);
    let value = single ? results[0] : results;
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return value;
  }
}
