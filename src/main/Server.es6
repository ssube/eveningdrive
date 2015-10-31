import cluster from 'cluster';
import http from 'http';
import Log from './Log';

export default class Server {
  constructor(config) {
    this._config = config;
    this._logger = new Log();

    this._logger.info('Spawned server.', config);
  }

  start() {
    this._logger.debug('Starting server.');

    this._startWorkers();
  }

  _startWorkers() {
    this._logger.debug('Starting workers.');
    let {workers} = this._config;
    for (let i = 0; i < this._config.workers.count; ++i) {
      cluster.fork({
        'WORKER_ROLE': 'worker',
        'WORKER_ID': i
      });
    }
  }
}
