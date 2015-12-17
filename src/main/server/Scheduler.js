import later from 'later';
import Promise from 'bluebird';

import QueuePool from './QueuePool';
import Template from './Template';

export default class Scheduler {
  static start(config, logger) {
    return new Scheduler(config, logger);
  }

  constructor(config, logger) {
    this._logger = logger.child({class: 'Scheduler'});
    this._queues = new QueuePool(config, logger);

    this._schedules = config.schedule.map(opts => {
      const {id, body, target} = opts;
      const schedule = {
        body: new Template(body),
        count: 0,
        id,
        target,
        timer: null
      };

      if (opts.cron) {
        schedule.pattern = later.parse.cron(opts.cron);
      } else if (opts.schedule) {
        schedule.pattern = later.parse.text(opts.schedule);
      } else {
        this._logger.warn('No pattern provided for schedule %s.', id);
      }

      return schedule;
    });
  }

  listen() {
    this._schedules.forEach(schedule => {
      schedule.timer = later.setInterval(this.tick.bind(this, schedule), schedule.pattern);
    })
  }

  close() {
    this._schedules.forEach(schedule => {
      if (schedule.timer) {
        schedule.timer.clear();
      }
    });
  }

  tick(schedule) {
    const {id} = schedule;
    const time = Date.now();
    const count = schedule.count++;
    const event = schedule.body.render({count, id, time});

    this._queues.add(event, 0, schedule.target).then(jobs => {
      this._logger.info('Scheduled %s jobs at %s (tick %s).', jobs.length, time, count);
    });
  }
}
