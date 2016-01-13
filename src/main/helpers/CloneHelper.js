const name = 'clone';
export default function CloneHelper(config, logger) {
  const _logger = logger.child({helper: name});
  return {
    name,
    cb: (data) => {
      _logger.debug('Executing template clone helper.', {data});
      return new handlebars.SafeString(JSON.stringify(data));
    }
  };
}
