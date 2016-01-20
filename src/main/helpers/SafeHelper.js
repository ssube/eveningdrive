const chars = {
  '\n': '\\\\n',
  '\\': '\\\\'
};

const name = 'safe';
export default function SafeHelper(config, logger) {
  const _logger = logger.child({helper: name});
  return {
    name,
    cb: (string) => {
      _logger.debug('Executing template safe helper.', {string});
      if (string) {
        return string.replace(/([\b\f\n\r\t"\\])/g, (match, char) => {
          return chars[char] || '';
        });
      } else {
        return '';
      }
    }
  };
}
