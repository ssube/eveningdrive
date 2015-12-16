import bull from 'bull';
import bunyan from 'bunyan';
import Promise from 'bluebird';
import Utils from './Utils';

const logger = bunyan.createLogger({name: 'Queue'});

export default class Queue {
  static cleanJobs(jobs) {
    if (Array.isArray(jobs)) {
      return jobs.map(Queue.cleanJobs);
    } else {
      return {
        attempts: jobs.attemptsMade,
        data: jobs.data,
        id: jobs.jobId
      };
    }
  }

  constructor(config) {
    const {host, id, name, pass = null, port, prefix} = config;

    this._id = id;
    this._name = name;
    this._queue = bull(name, port, host, {
      auth_pass: pass,
      prefix
    });
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  listen(cb) {
    return this._queue.process(cb);
  }

  close() {
    return this._queue.close();
  }

  pause() {
    return this._queue.pause();
  }

  resume() {
    return this._queue.resume();
  }

  flush() {
    return this._queue.empty();
  }

  add(event, options) {
    return this._queue.add(event, options).then(Queue.cleanJobs);
  }

  get(id) {
    return this._queue.getJob(id).then(Queue.cleanJobs);
  }

  getAll() {
    const eventsByStatus = [
      this.getPending(),
      this.getRunning(),
      this.getCompleted(),
      this.getFailed()
    ];

    return Promise.all(eventsByStatus).then(Utils.flatten);
  }

  getPending() {
    return this._queue.getWaiting().then(Queue.cleanJobs);
  }

  getRunning() {
    return this._queue.getActive().then(Queue.cleanJobs);
  }

  getCompleted() {
    return this._queue.getCompleted().then(Queue.cleanJobs);
  }

  getFailed() {
    return this._queue.getWaiting().then(Queue.cleanJobs);
  }
}
