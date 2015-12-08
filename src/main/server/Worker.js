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
    this._transforms = config.transform;
    this._queues = config.queues;
    this._stats = config.stats;
  }

  listen() {
    this._queues.forEach(info => {
      const {id, queue, transform} = info;
      logger.info('Listening for events on channel: %s', id);
      queue.process(event => {
        logger.info('Processing event %s on transform %s.', event.id, transform.id);
        this._stats.increment(`worker.${id}.events`);
        transform.process(event).then(output => {
          this.enqueue({
            id: Date.now(),
            data: output
          }, transform.id);
        });
      });
    })
  }

  close() {
    // nop
  }

  /**
   * Add a new event (output from some transform) to the queue.
   **/
  enqueue(event, source) {
    // Find all transforms taking input from the source
    this._queues.each(info => {
      if (info.transform.inputs.indexOf(source) > -1) {
        info.queue.add(event);
      }
    });
  }
}
