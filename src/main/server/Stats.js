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

  /**
   * Get the underlying stats client.
   * You should not rely on the type of this, only that it can be used
   * as a middleware for express.
   **/
  get client() {
    return this._statsd;
  }

  close() {
    this._statsd.close();
  }

  counter(name, value = 1) {
    logger.info('Updating counter %s by %s.', name, value);
    this._statsd.counter(name, value);
  }

  gauge(name, value) {
    logger.info('Gauging %s at %s.', name, value);
    this._statsd.gauge(name, value);
  }
}
