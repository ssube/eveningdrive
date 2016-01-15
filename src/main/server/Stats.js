import Promise from 'bluebird';
import SDC from 'statsd-client';

export default class Stats {
  constructor(config, logger) {
    this._logger = logger.child({class: 'Stats'});

    const stats = config.statsd;
    this._logger.info('Starting StatsD client.');
    this._statsd = new SDC(stats);
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
    this._logger.debug('Updating counter %s by %s.', name, value);
    this._statsd.counter(name, value);
  }

  gauge(name, value) {
    this._logger.debug('Gauging %s at %s.', name, value);
    this._statsd.gauge(name, value);
  }
}
