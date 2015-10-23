export default class Worker {
  constructor(config) {
    this._config = config;
  }

  start() {
    console.log('Spawned worker!');
  }
}
