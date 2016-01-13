import handlebars from 'handlebars';

import Utils from '../Utils';

const name = 'path';
export default function PathHelper(config, logger) {
  const _logger = logger.child({helper: name});
  return {
    name,
    cb: (path, data, single = true) => {
      const value = Utils.lookup(data, path, single);
      _logger.debug('Executing template path helper.', {path, value, data, single});
      return new handlebars.SafeString(value);
    }
  };
}
