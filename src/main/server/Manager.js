import bunyan from 'bunyan';
import cluster from 'cluster';
import Promise from 'bluebird';

const logger = bunyan.createLogger({name: 'Manager'});

export default class Manager {
  static start(config) {
    return new Manager(config);
  }

  constructor(config) {
    this._config = config;
    this._children = [];
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
  }

  close() {
    this._children.map(child => {
      if (child.isConnected() && !child.isDead()) {
        logger.info('Interrupting child %s.', child.id);
        child.kill('SIGINT');
      } else {
        logger.warn(
          'Unable to interrupt child %s (may be disconnected or already dead).',
          child.id
        );
      }
    });
  }
}
