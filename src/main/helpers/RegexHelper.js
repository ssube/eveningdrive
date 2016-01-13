const name = 'regex';
export default function RegexHelper(config, logger) {
  const _logger = logger.child({helper: name});
  return {
    name,
    cb: (string, pattern, replace, flags = '') => {
      const regex = new RegExp(pattern, flags);
      return string.replace(regex, replace);
    }
  }
}
