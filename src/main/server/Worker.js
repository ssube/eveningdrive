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
      const transform = Transform.create(transformOpts.class, transformOpts, config);
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
      this._stats.counter(`transform.${source}.events_rcvd`);

      const transform = this._transforms[source];
      logger.debug('Sending event %s to transform %s.', job.jobId, transform.id);

      try {
        return transform.process(event, job.jobId).then(output => {
          if (typeof output === 'object') {
            logger.debug('Received output event.');
            this._stats.counter(`transform.${source}.events_sent`);
            return this._queues.add(output, source);
          } else {
            logger.debug('Received no output event.');
            return Promise.resolve();
          }
        });
      } catch (e) {
        logger.warn(e, 'Error processing transform on event.');
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
