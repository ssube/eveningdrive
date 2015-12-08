import bunyan from 'bunyan';
import Promise from 'bluebird';

const logger = bunyan.createLogger({name: 'Worker'});

export default class Worker {
  static start(config) {
    return new Promise((res, rej, onCancel) => {
      const worker = new Worker(config);
      worker.listen();
      onCancel(() => {
        worker.close();
      })
    });
  }

  constructor(config) {
    this._config = config;
    this._transforms = config.transform;
    this._queues = config.queues;
    this._stats = config.stats;
  }

  listen() {
    this._queues.forEach(info => {
      const {name, queue, transform} = info;
      logger.info('Listening for events on channel: %s', name);
      queue.process(job => {
        const event = job.data;
        logger.info('Processing event %s through transform %s.', event.id, transform.id);
        //this._stats.increment(`worker.${id}.events`);
        return transform.process(event).then(output => {
          if (output) {
            logger.info(
              'Processing completed for event %s, enqueueing output as %s.',
              event.id, output.id
            );
            return this._config.enqueue(output, transform.id);
          } else {
            logger.info('Processing completed for event %s, no output received.', event.id);
            return null;
          }
        }).catch(err => {
          logger.info('Process failed for event %s: %s', event.id, err);
          return null;
        });
      });
    })
  }

  close() {
    // nop
  }
}
