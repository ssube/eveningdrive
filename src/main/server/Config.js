import Queue from 'bull';
import StatsDClient from 'statsd-client';

// Import transforms
import JsonTransform from './transforms/JsonTransform';

export default class Config {
  static loadFrom(path) {
    const data = require(path);
    return new Config(data);
  }

  static getTransformClass(name) {
    switch (name) {
      case "json":
        return JsonTransform;
    }
  }

  constructor(data) {
    this._data = data;

    // Create all necessary connections and instances
    this._queues = this.transform.map(transform => {
      const queueName = `transform-${transform.id}`;
      const transformClass = Config.getTransformClass(transform.class);
      return {
        name: queueName,
        queue: Queue(queueName, port, host),
        transform: new transformClass(transform.opts)
      };
    });

    this._stats = new StatsDClient(this._data.stats);
  }

  close() {
    this._queues.each(info => {
      info.queue.close();
    });
    this._stats.close();
  }

  get worker() {
    return this._data.worker;
  }

  get server() {
    return this._data.server;
  }

  get transform() {
    return this._data.transform;
  }

  get queues() {
    return this._queues;
  }

  get stats() {
    return this._stats;
  }
}
