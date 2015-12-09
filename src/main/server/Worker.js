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
      logger.info('Received event %s on channel %s.', event.id, source);
      this._stats.increment(`events.${source}.incoming`);

      const transform = this._transforms[source];
      logger.debug('Sending event %s to transform %s.', event.id, transform.id);

      try {
        return transform.process(event).then(output => {
          if (output) {
            logger.debug('Received output event %s from event %s.', output.id, event.id);
            this._stats.increment(`events.${source}.outgoing`);
            return this._queues.add(output, source);
          } else {
            logger.debug('Received no output from event %s.', event.id);
            return Promise.resolve();
          }
        });
      } catch (e) {
        logger.warn('Error processing transform on event %s.', event.id, e);
        return Promise.resolve();
      }
    });
  }

  close() {
    this._queues.close();
    this._stats.close();
  }
}
