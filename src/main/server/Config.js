import bunyan from 'bunyan';
import Queue from 'bull';
import StatsDClient from 'statsd-client';

// Import transforms
import JsonTransform from '../transforms/JsonTransform';
import LoggingTransform from '../transforms/LoggingTransform';
import HandlebarsTransform from '../transforms/HandlebarsTransform';

const logger = bunyan.createLogger({name: 'Config'});

// TODO: break this class down (it's a connection pool for multiple tools, not config)
export default class Config {
  static loadFrom(path) {
    const data = require(path);
    return new Config(data);
  }

  static getTransformClass(name) {
    switch (name) {
      case "json":
        return JsonTransform;
      case "logging":
        return LoggingTransform;
      case "template":
        return HandlebarsTransform;
    }
  }

  constructor(data) {
    this._data = data;

    // Create all necessary redis/bull channels
    const redisConnection = this._data.redis;
    this._queues = this.transform.map(transform => {
      const queueName = `transform-${transform.id}`;
      const transformClass = Config.getTransformClass(transform.class);
      const queue = {
        name: queueName,
        queue: Queue(queueName, redisConnection.port, redisConnection.host),
        transform: new transformClass(transform)
      };
      logger.info('Creating queue %s and transform from %s.', queueName, transformClass.name, {
        queue
      });
      return queue;
    });

    // Create statsd connection
    const statsdConnection = this._data.statsd;
    logger.info('Creating StatsD connection.', {opts: statsdConnection});
    this._stats = new StatsDClient(statsdConnection);
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

  /**
   * Add a new event (output from some transform) to the queue.
   **/
  enqueue(event, source, targets = []) {
    logger.info('Searching for transforms for event %s from %s (targeting %s).', event.id, source, targets);

    // Collect transforms with this source as an input or explicitly targeted
    const inputSinks = this._queues.filter(info => {
      return info.transform.inputs.some(item => {
        return item == source;
      });
    });
    const targetSinks = this._queues.filter(info => {
      return targets.some(item => {
        return item == info.transform.id;
      });
    });
    const sinks = inputSinks.concat(targetSinks);

    if (sinks.length) {
      logger.info('Sending event %s to transforms: %s', event.id, sinks);

      sinks.forEach(sink => {
        sink.queue.add(event);
      });
    } else {
      logger.info('No transforms for event %s.', event.id);
    }

    return Promise.resolve(sinks.map(sink => sink.transform.id));
  }
}
