const name = 'substr';
export default function SubstrHelper(config, logger) {
  const _logger = logger.child({helper: name});
  return {
    name,
    cb: (string, len) => {
      _logger.debug('Executing template substr helper.', {string, len});
      if (string) {
        return string.substr(0, len);
      } else {
        return '';
      }
    }
  };
}
