const defaultTransforms = {
  array: (it) => it.map(Walker.iterate),
  object: (it) => {
    return Object.keys(target).reduce((p, key) => {
      p[key] = Walker.iterate(target[key]);
      return p;
    }, {});
  },
  string: (it) => it,
  function: (it) => it,
  default: (it) => it,
};

export default class Walker {
  static iterate(target, transforms = {}) {
    if (Array.isArray(target)) {
      return transforms.array ? transforms.array(target) : defaultTransforms.array(target);
    } else if (typeof target === 'object') {
      return transforms.object ? transforms.object(target) : defaultTransforms.object(target);
    } else if (typeof target === 'function') {
      return transforms.function ? transforms.function(target) : defaultTransforms.function(target);
    } else if (typeof target === 'string') {
      return transforms.string ? transforms.string(target) : defaultTransforms.string(target);
    } else {
      return transforms.default ? transforms.default(target) : defaultTransforms.default(target);
    }
  }
}
