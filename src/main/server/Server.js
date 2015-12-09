import bunyan from 'bunyan';
import express from 'express';
import Promise from 'bluebird';
import bodyParser from 'body-parser';

import QueuePool from './QueuePool';
import Stats from './Stats';

const logger = bunyan.createLogger({name: 'Server'});

export default class Server {
  static start(config) {
    return new Server(config);
  }

  constructor(config) {
    this._app = express();
    this._app.use(bodyParser.json());

    this._config = config;
    this._port = config.server.port || 8080;
    this._queues = new QueuePool(config);
    this._stats = new Stats(config);
    this.createRoutes();
  }

  createRoutes() {
    this._app.get('/', (req, res) => {
      res.status(200).send({
        'content': 'Hello World!'
      });
    });

    this._app.get('/transform', (req, res) => {
      this._stats.increment('server.endpoint.transform');
      res.status(200).send(this._config.transform);
    });

    this._app.post('/event', (req, res) => {
      const transform = req.query.transform;

      this._stats.increment('server.endpoint.event.create');
      this._stats.increment(`server.endpoint.event.create.${transform}`);
      logger.info('Creating webhook event for transform %s.', transform);

      this._queues.add(req.body, 0, [transform]).then(ids => {
        res.status(201).send({
          'status': 'queued event',
          'events': ids
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
