import bunyan from 'bunyan';
import Queue from 'bull';
import StatsDClient from 'statsd-client';

// Import transforms
import JsonTransform from '../transforms/JsonTransform';

const logger = bunyan.createLogger({name: 'Config'});

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
    const redisConnection = this._data.redis;
    this._queues = this.transform.map(transform => {
      const queueName = `transform-${transform.id}`;
      const transformClass = Config.getTransformClass(transform.class);
      logger.info('Creating queue %s and transform from %s.', queueName, transformClass.name);
      return {
        name: queueName,
        queue: Queue(queueName, redisConnection.port, redisConnection.host),
        transform: new transformClass(transform.opts)
      };
    });

    this._stats = new StatsDClient(this._data.statsd);
  }

  close() {
    this.queues.forEach(info => {
      info.queue.close();
    });
    this.stats.close();
  }

  get worker() {
    return this._data.worker;
  }

  get server() {
    return this._data.server;
  }

  get redis() {
    return this._data.redis;
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
