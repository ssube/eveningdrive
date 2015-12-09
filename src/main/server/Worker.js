import bunyan from 'bunyan';
import Promise from 'bluebird';

import QueuePool from './QueuePool';
import Transform from '../transforms/Transform';
import Stats from './Stats';

const logger = bunyan.createLogger({name: 'Worker'});

export default class Worker {
  static start(config) {
    return new Worker(config);
  }

  constructor(config) {
    this._config = config;
    this._transforms = config.transform.reduce((p, transformOpts) => {
      const transform = Transform.create(transformOpts.class, transformOpts);
      p[transform.id] = transform;
      return p;
    }, {});

    this._queues = new QueuePool(config);
    this._stats = new Stats(config);
  }

  listen() {
    this._queues.listen((queue, job) => {
      const source = queue.id;
      const event = job.data;
      logger.info('Received event %s on channel %s.', job.jobId, source);
      this._stats.increment(`transform.${source}.events_sent`);

      const transform = this._transforms[source];
      logger.debug('Sending event %s to transform %s.', job.jobId, transform.id);

      try {
        return transform.process(event, job.jobId).then(output => {
          if (output) {
            logger.debug('Received output event.');
            this._stats.increment(`transform.${source}.events_rcvd`);
            return this._queues.add(output, source);
          } else {
            logger.debug('Received no output event.');
            return Promise.resolve();
          }
        });
      } catch (e) {
        logger.warn('Error processing transform on event.', e);
        return Promise.resolve();
      }
    });
  }

  close() {
    this._queues.close();
    this._stats.close();
  }
}
