import Event from './Event';
import Log from './Log';

export default class Worker {
  constructor(config) {
    this._config = config;
    this._logger = new Log();

    this._logger.info('Spawned worker.', config);
  }

  start() {
    this._logger.info('Starting worker.');

    const steps = this._config.steps.map(step => {
      let type = step.type;
      let clazz = require('./steps/' + type);
      return new clazz(step);
    });

    // TEST CODE
    let event = new Event({}, {foo: Math.random()});
    steps.map(step => step.process(event.data)).map(out => console.log(out));
  }
}
