import bunyan from 'bunyan';
import express from 'express';
import Promise from 'bluebird';
import bodyParser from 'body-parser';

import QueuePool from './QueuePool';
import Stats from './Stats';

import Controllers from '../controllers/Controllers';

const logger = bunyan.createLogger({name: 'Server'});

export default class Server {
  static start(config) {
    return new Server(config);
  }

  constructor(config) {
    this._config = config;
    this._port = config.server.port || 8080;
    this._queues = new QueuePool(config);
    this._stats = new Stats(config);

    this._app = express();
    this._app.use(this._stats.client.helpers.getExpressMiddleware('server.global'));
    this._app.use(bodyParser.json());
  }

  get stats() {
    return this._stats;
  }

  get transforms() {
    return this._config.transform;
  }

  get queues() {
    return this._queues;
  }

  listen() {
    logger.info('Setting up controllers.');
    const router = Controllers(this);
    this._app.use(router);

    logger.info('Binding server port.')
    this._server = this._app.listen(this._port, () => {
      const address = this._server.address();
      logger.info('Server listening on %s:%s.', address.address, address.port);
    });
  }

  close() {
    this._server.close();
  }
}
