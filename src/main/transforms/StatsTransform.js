import Transform from './Transform';
import Stats from '../server/Stats';

export default class StatsTransform extends Transform {
  constructor(opts, config) {
    super(opts);
    this._stats = new Stats(config);
  }

  close() {
    this._stats.close();
  }

  process(event) {
    const {type, name, value = 1} = event;
    switch (type) {
      case 'increment':
        this._stats.increment(key);
        break;
      case 'gauge':
        this._stats.gauge(name, value);
        break;
    }
    this.emit();
  }
}
