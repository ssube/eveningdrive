import bunyan from 'bunyan';
import Promise from 'bluebird';
import SDC from 'statsd-client';

const logger = bunyan.createLogger({name: 'Stats'});

export default class Stats {
  constructor(config) {
    const stats = config.statsd;
    logger.info('Starting StatsD client.');
    this._statsd = new SDC({
      host: stats.host
    });
  }

  increment(name) {
    logger.info('Incrementing %s.', name);
    this._statsd.increment(name);
  }

  gauge(name, value) {
    logger.info('Gauging %s at %s.', name, value);
    this._statsd.gauge(name, value);
  }
}
