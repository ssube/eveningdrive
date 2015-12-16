import bull from 'bull';
import bunyan from 'bunyan';
import Promise from 'bluebird';
import Utils from './Utils';

export default class Queue {
  constructor(config) {
    const {host, id, name, pass = null, port, prefix} = config;

    this._id = id;
    this._name = name;
    this._queue = bull(name, port, host, {
      auth_pass: pass,
      prefix
    });

    this._logger = bunyan.createLogger({name: `Queue-${id}`});
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  cleanJobs(jobs) {
    if (Array.isArray(jobs)) {
      return Utils.compact(jobs).map(jobs => this.cleanJobs(jobs));
    } else if (jobs) {
      return {
        attempts: jobs.attemptsMade,
        data: jobs.data,
        id: jobs.jobId,
        transform: this._id
      };
    } else {
      return null;
    }
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
    return this._queue.add(event, options).then(jobs => this.cleanJobs(jobs));
  }

  get(id) {
    return this._queue.getJob(id).then(jobs => this.cleanJobs(jobs));
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
    return this._queue.getWaiting().then(jobs => this.cleanJobs(jobs));
  }

  getRunning() {
    return this._queue.getActive().then(jobs => this.cleanJobs(jobs));
  }

  getCompleted() {
    return this._queue.getCompleted().then(jobs => this.cleanJobs(jobs));
  }

  getFailed() {
    return this._queue.getFailed().then(jobs => this.cleanJobs(jobs));
  }
}
