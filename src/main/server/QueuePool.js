import bunyan from 'bunyan';
import Promise from 'bluebird';

import Queue from './Queue';
import Utils from './Utils';

const logger = bunyan.createLogger({name: 'QueuePool'});

export default class QueuePool {
  /**
   * @param links A hash where keys are the IDs of each channel and the value is an array
   *              of input channels (sink:[sources])
   **/
  constructor(config) {
    logger.info('Creating queue pool.');

    let transforms = config.transform;
    this._links = transforms.reduce((p, transform) => {
      p[transform.id] = transform.inputs;
      return p;
    }, {});

    const prefix = 'transform';
    let {host, port} = config.redis;
    this._channels = Object.keys(this._links).map(id => {
      const name = `${prefix}-${id}`;
      return new Queue({id, host, name, port});
    });

    this._job = config.worker.job;
  }

  getChannel(id) {
    return this._channels.filter(channel => channel.id == id);
  }

  listen(cb) {
    return Promise.all(this._channels.map(channel => channel.listen(job => {
      logger.info('Received event %s for transform %s.', job.jobId, channel.id);
      return cb(channel, job);
    })));
  }

  close() {
    return Promise.all(this._channels.map(channel => channel.close()));
  }

  pause() {
    return Promise.all(this._channels.map(channel => channel.pause()));
  }

  resume() {
    return Promise.all(this._channels.map(channel => channel.resume()));
  }

  flush() {
    return Promise.all(this._channels.map(channel => channel.flush()));
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
      const channels = Utils.flatten(sinks.map(sink => {
        return this.getChannel(sink);
      }));

      return Promise.all(channels.map(channel => {
        return channel.add(event, this._job).then(job => {
          logger.info('Created event %s.', job.jobId);
          return job;
        });
      }));
    } else {
      logger.debug('No destination found, skipping event.');
      return Promise.resolve([]);
    }
  }

  get(eventId, transformId = 0) {
    let results;
    if (transformId) {
      results = Promise.all(this.getChannel(transformId).map(channel => channel.get(eventId)));
    } else {
      results = Promise.all(this._channels.map(channel => channel.get(eventId)));
    }

    return results.then(Utils.compact);
  }

  getWaiting() {
    return Promise.all(this._channels.map(channel => channel.getWaiting())).then(Utils.flatten);
  }

  getRunning() {
    return Promise.all(this._channels.map(channel => channel.getRunning())).then(Utils.flatten);
  }

  getCompleted() {
    return Promise.all(this._channels.map(channel => channel.getCompleted())).then(Utils.flatten);
  }

  getFailed() {
    return Promise.all(this._channels.map(channel => channel.getFailed())).then(Utils.flatten);
  }
}
