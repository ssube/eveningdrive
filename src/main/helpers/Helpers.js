import CloneHelper from './CloneHelper';
import PathHelper from './PathHelper';
import RegexHelper from './RegexHelper';
import SafeHelper from './SafeHelper';
import SharedHelper from './SharedHelper';
import SubstrHelper from './SubstrHelper';

const helpers = [
  CloneHelper,
  PathHelper,
  RegexHelper,
  SafeHelper,
  SharedHelper,
  SubstrHelper
];

export default function registerHelpers(config, handlebars, logger) {
  helpers.map(helper => helper(config, logger)).forEach(helper => {
    const {name, cb} = helper;
    handlebars.registerHelper(name, cb);
  });
}
