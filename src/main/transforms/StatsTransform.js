import Transform from './Transform';
import Stats from '../server/Stats';

export default class StatsTransform extends Transform {
  constructor(opts, config, logger) {
    super(opts, config, logger);

    this._stats = new Stats(config, logger);
    this._type = this.getOption('type', 'increment');
    this._name = this.getOption('name');
    this._value = this.getOption('value', '1');
  }

  close() {
    this._stats.close();
  }

  process(event) {
    try {
      const value = parseInt(this._value.render(event), 10);
      const type = this._type.render(event);
      const name = this._name.render(event);

      switch (type) {
        case 'increment':
          this._logger.debug('Sending stats increment.', {name, value});
          this._stats.counter(name, value);
          break;
        case 'gauge':
          this._logger.debug('Sending stats guage.', {name, value});
          this._stats.gauge(name, value);
          break;
      }

      return this.emit(null);
    } catch (e) {
      return this.fail(e);
    }
  }
}
