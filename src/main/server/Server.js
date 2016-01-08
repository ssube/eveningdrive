import bodyParser from 'body-parser';
import express from 'express';
import Promise from 'bluebird';

import QueuePool from './QueuePool';
import Stats from './Stats';

import Controllers from '../controllers/Controllers';

export default class Server {
  static start(config, logger) {
    return new Server(config, logger);
  }

  constructor(config, logger) {
    this._config = config;
    this._logger = logger.child({class: 'Server'});

    this._port = config.server.port || 8080;
    this._queues = new QueuePool(config, logger);
    this._stats = new Stats(config, logger);

    this._app = express();
    this._app.use(this._stats.client.helpers.getExpressMiddleware('server.global'));
    this._app.use(bodyParser.json({limit: config.server.limit}));
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
    this._logger.info('Setting up controllers.');
    const router = Controllers(this);
    this._app.use(router);

    this._logger.info('Binding server port.')
    this._server = this._app.listen(this._port, () => {
      const address = this._server.address();
      this._logger.info('Server listening on %s:%s.', address.address, address.port);
    });
  }

  close() {
    this._server.close();
  }
}
