import Promise from 'bluebird';

import Queue from './Queue';
import Utils from '../Utils';

export default class QueuePool {
  /**
   * @param links A hash where keys are the IDs of each queue and the value is an array
   *              of input queues (sink:[sources])
   **/
  constructor(config, logger) {
    this._logger = logger.child({class: 'QueuePool'});

    let transforms = config.transform;
    this._links = transforms.reduce((p, transform) => {
      p[transform.id] = transform.inputs;
      return p;
    }, {});

    const prefix = 'transform';
    let {host, port} = config.redis;
    this._queues = Object.keys(this._links).map(id => {
      const name = `${prefix}-${id}`;
      return new Queue({id, host, name, port}, this._logger);
    });

    this._job = config.worker.job;
  }

  getQueue(id) {
    return this._queues.filter(queue => queue.id == id);
  }

  listen(cb) {
    return Promise.all(this._queues.map(queue => queue.listen(job => {
      this._logger.info('Received event %s for transform %s.', job.jobId, queue.id);
      return cb(queue, job);
    })));
  }

  close() {
    return Promise.all(this._queues.map(queue => queue.close()));
  }

  pause() {
    return Promise.all(this._queues.map(queue => queue.pause()));
  }

  resume() {
    return Promise.all(this._queues.map(queue => queue.resume()));
  }

  flush() {
    return Promise.all(this._queues.map(queue => queue.flush()));
  }

  add(event, source, targets = []) {
    this._logger.info('Creating event from %s.', source, {event, targets});

    const inputSinks = Object.keys(this._links).filter(link => {
      const sources = this._links[link];
      return sources.some(potentialSource => {
        return potentialSource == source;
      });
    });

    const sinks = targets.concat(inputSinks);

    if (sinks.length) {
      const queues = Utils.flatten(sinks.map(sink => {
        return this.getQueue(sink);
      }));

      return Promise.all(queues.map(queue => {
        return queue.add(event, this._job).then(job => {
          this._logger.info('Created event %s.', job.id);
          return job;
        });
      }));
    } else {
      this._logger.debug('No destination found, skipping event.');
      return Promise.resolve([]);
    }
  }

  get(eventId, transformId = 0) {
    let results;
    if (transformId) {
      results = Promise.all(this.getQueue(transformId).map(queue => queue.get(eventId)));
    } else {
      results = Promise.all(this._queues.map(queue => queue.get(eventId)));
    }

    return results.then(Utils.compact);
  }

  getAll() {
    return Promise.all(this._queues.map(queue => queue.getAll())).then(Utils.flatten);
  }

  getPending() {
    return Promise.all(this._queues.map(queue => queue.getPending())).then(Utils.flatten);
  }

  getRunning() {
    return Promise.all(this._queues.map(queue => queue.getRunning())).then(Utils.flatten);
  }

  getCompleted() {
    return Promise.all(this._queues.map(queue => queue.getCompleted())).then(Utils.flatten);
  }

  getFailed() {
    return Promise.all(this._queues.map(queue => queue.getFailed())).then(Utils.flatten);
  }
}
