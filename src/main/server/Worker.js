import Promise from 'bluebird';

import QueuePool from './QueuePool';
import Transform from '../transforms/Transform';
import Stats from './Stats';

export default class Worker {
  static start(config, logger) {
    return new Worker(config, logger);
  }

  constructor(config, logger) {
    this._config = config;
    this._logger = logger.child({class: 'Worker'});
    this._transforms = config.transform.reduce((p, transformOpts) => {
      const transform = Transform.create(transformOpts.class, transformOpts, config, logger);
      p[transform.id] = transform;
      return p;
    }, {});

    this._queues = new QueuePool(config, logger);
    this._stats = new Stats(config, logger);
  }

  listen() {
    this._queues.listen((queue, job) => {
      const source = queue.id;
      const event = job.data;
      this._logger.info('Received event %s on channel %s.', job.jobId, source);
      this._stats.counter(`transform.${source}.events_rcvd`);

      const transform = this._transforms[source];
      this._logger.debug('Sending event %s to transform %s.', job.jobId, transform.id);

      try {
        return transform.process(event, job.jobId).then(output => {
          if (output) {
            this._logger.debug('Received output event.');
            this._stats.counter(`transform.${source}.events_sent`);
            return this._queues.add(output, source);
          } else {
            this._logger.debug('Received no output event.');
            return Promise.resolve();
          }
        });
      } catch (e) {
        this._logger.warn(e, 'Error processing transform on event.');
        return Promise.resolve();
      }
    });
  }

  close() {
    Object.keys(this._transforms).forEach(key => {
      const transform = this._transforms[key];
      transform.close();
    });
    this._queues.close();
    this._stats.close();
  }
}
