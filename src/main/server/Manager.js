import cluster from 'cluster';
import Promise from 'bluebird';

export default class Manager {
  static start(config, logger) {
    return new Manager(config, logger);
  }

  constructor(config, logger) {
    this._config = config;
    this._children = [];
    this._logger = logger.child({class: 'Manager'});
  }

  listen() {
    const config = this._config;
    for (let i = 0; i < config.worker.count; ++i) {
      this._children.push(cluster.fork({
        'WORKER_ROLE': 'worker'
      }));
    }

    for (let i = 0; i < config.server.count; ++i) {
      this._children.push(cluster.fork({
        'WORKER_ROLE': 'server'
      }));
    }

    this._children.push(cluster.fork({
      'WORKER_ROLE': 'scheduler'
    }));
  }

  close() {
    this._children.map(child => {
      if (child.isConnected() && !child.isDead()) {
        this._logger.info('Interrupting child %s.', child.id);
        child.kill('SIGINT');
      } else {
        this._logger.warn(
          'Unable to interrupt child %s (may be disconnected or already dead).',
          child.id
        );
      }
    });
  }
}
