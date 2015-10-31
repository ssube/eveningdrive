import Log from './Log';

export default class Worker {
  constructor(config) {
    this._config = config;
    this._logger = new Log();

    this._logger.info('Spawned worker.', config);
  }

  start() {
    this._logger.info('Starting worker.');
  }
}
