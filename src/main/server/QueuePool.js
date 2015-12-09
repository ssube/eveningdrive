import bunyan from 'bunyan';
import Promise from 'bluebird';

import Queue from './Queue';

const logger = bunyan.createLogger({name: 'QueuePool'});

export default class QueuePool {
  /**
   * @param links A hash where keys are the IDs of each channel and the value is an array
   *              of input channels (sink:[sources])
   **/
  constructor(config) {
    const prefix = 'transform';
    let {host, port} = config.redis;
    let transforms = config.transform;

    logger.info('Creating queue pool.');

    this._links = transforms.reduce((p, transform) => {
      p[transform.id] = transform.inputs;
      return p;
    }, {});

    this._channels = Object.keys(this._links).map(id => {
      const name = `${prefix}-${id}`;
      const queue = new Queue({host, name, port});
      return {id, name, queue};
    });
  }

  listen(cb) {
    this._channels.forEach(channel => channel.queue.listen(job => {
      logger.info('Received event %s for transform %s.', job.jobId, channel.id);
      return cb(channel, job);
    }));
  }

  close() {
    this._channels.forEach(channel => channel.queue.close());
  }

  getChannel(id) {
    return this._channels.filter(channel => channel.id == id);
  }

  add(event, source, targets = []) {
    logger.info('Creating event from %s.', source, {targets});

    const inputSinks = Object.keys(this._links).filter(link => {
      const sources = this._links[link];
      return sources.some(potentialSource => {
        return potentialSource == source;
      });
    });

    const sinks = targets.concat(inputSinks);

    if (sinks.length) {
      return Promise.all(sinks.map(sink => {
        return this.getChannel(sink);
      }).reduce((p, c) => p.concat(c), []).map(channel => {
        return channel.queue.add(event).then(job => {
          logger.info('Created event %s.', job.jobId);
        });
      }));
    } else {
      logger.info('No destination found, skipping event.');
      return Promise.resolve();
    }
  }
}
