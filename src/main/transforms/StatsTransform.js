import Transform from './Transform';
import Stats from '../server/Stats';

export default class StatsTransform extends Transform {
  constructor(opts, config) {
    super(opts);
    this._stats = new Stats(config);
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
          this._stats.increment(key, value);
          break;
        case 'gauge':
          this._stats.gauge(name, value);
          break;
      }

      return this.emit();
    } catch (e) {
      return this.fail(e);
    }
  }
}
