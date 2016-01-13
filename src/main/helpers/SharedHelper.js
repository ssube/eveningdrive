import handlebars from 'handlebars';

import Utils from '../Utils';

const name = 'shared';
export default function SharedHelper(config, logger) {
  const _logger = logger.child({helper: name});
  return {
    name,
    cb: (path, single = true) => {
      const value = Utils.lookup(config.shared, path, single);
      _logger.debug('Executing template shared helper.', {path, value});
      return new handlebars.SafeString(value);
    }
  };
}
