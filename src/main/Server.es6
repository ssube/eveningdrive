import cluster from 'cluster';
import http from 'http';

export default class Server {
  constructor(config) {
    this._config = config;
  }

  start() {
    this._startWorkers();
  }

  startWorkers() {
    let {workers} = this._config;
    for (let i = 0; i < config.workers.count; ++i) {
      cluster.fork({
        'WORKER_ROLE': 'worker',
        'WORKER_ID': i
      });
    }
  }
}
