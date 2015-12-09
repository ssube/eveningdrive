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
      logger.info('Received job %s for channel %s.', job.id, channel.id);
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
    logger.info('Adding event %s from %s.', event.id, source, {targets});

    const inputSinks = Object.keys(this._links).filter(link => {
      const sources = this._links[link];
      return sources.some(potentialSource => {
        return potentialSource == source;
      });
    });

    const sinks = targets.concat(inputSinks);

    if (sinks.length) {
      logger.info('Sending event %s to %s channels.', event.id, sinks.length, {sinks});

      return Promise.all(sinks.map(sink => {
        return this.getChannel(sink);
      }).reduce((p, c) => p.concat(c), []).map(channel => {
        logger.info('Forwarding event to channel %s.', channel.id, typeof channel.queue.add);
        return channel.queue.add(event);
      }));
    } else {
      logger.info('No channels found for event %s.', event.id);
      return Promise.resolve();
    }
  }
}
