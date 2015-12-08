import Promise from 'bluebird';

export default class Manager {
  static start(config) {
    return new Promise((res, rej, onCancel) => {
      let children = [];

      for (let i = 0; i < config.worker.count; ++i) {
        children.push(cluster.fork({
          'WORKER_ROLE': 'worker',
          'WORKER_ID': i
        }));
      }

      for (let i = 0; i < config.server.count; ++i) {
        children.push(cluster.fork({
          'WORKER_ROLE': 'server',
          'WORKER_ID': i
        }));
      }

      onCancel(() => {
        children.map(child => {
          if (child.isConnected() && !child.isDead()) {
            logger.info('Interrupting child %i.', child.id);
            child.kill('SIGINT');
          } else {
            logger.warn(
              'Unable to interrupt child %i (may be disconnected or already dead).',
              child.id
            );
          }
        });
      });
    });
  }
}
