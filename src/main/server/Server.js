import bunyan from 'bunyan';
import express from 'express';
import Promise from 'bluebird';
import bodyParser from 'body-parser';

import QueuePool from './QueuePool';

const logger = bunyan.createLogger({name: 'Server'});

export default class Server {
  static start(config) {
    return new Promise((res, rej, onCancel) => {
      let server = new Server(config);
      server.listen();
      onCancel(() => {
        server.close();
      });
    });
  }

  constructor(config) {
    this._app = express();
    this._app.use(bodyParser.json());

    this._config = config;
    this._port = config.server.port || 8080;
    this._queues = new QueuePool({
      host: config.redis.host,
      port: config.redis.port,
      transforms: config.transform
    });
    this.createRoutes();
  }

  createRoutes() {
    this._app.get('/', (req, res) => {
      res.status(200).send({
        'content': 'Hello World!'
      });
    });

    this._app.get('/transform', (req, res) => {
      res.status(200).send(this._config.transform);
    });

    this._app.post('/event/transform/:id', (req, res) => {
      const event = {
        id: Date.now(),
        data: req.body
      };

      logger.info('Adding webhook event %s for transform %s.', event.id, req.params.id);
      this._queues.add(event, 0, [req.params.id]).then(() => {
        res.status(201).send({
          'status': 'queued event',
          'event': event
        });
      });
    });
  }

  listen() {
    this._server = this._app.listen(this._port, () => {
      const address = this._server.address();
      logger.info('Server listening on %s:%s.', address.address, address.port);
    });
  }

  close() {
    this._server.close();
  }
}
