import bunyan from 'bunyan';
import express from 'express';
import Promise from 'bluebird';
import bodyParser from 'body-parser';

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
    this._config = config;
    this._port = config.server.port || 8080;
    this._app = express();
    this._app.use(bodyParser.json());
    this._stats = config.stats;
    this.createRoutes();
  }

  createRoutes() {
    this._app.get('/', (req, res) => {
      this._stats.increment('server.requests');
      res.status(200).send({
        'content': 'Hello World!'
      });
    });

    this._app.get('/transform', (req, res) => {
      res.status(200).send(this._config.transform);
    });

    this._app.post('/event/transform/:id', (req, res) => {
      logger.info('Enqueueing webhook event for transform %s.', req.params.id);
      const event = {
        id: Date.now(),
        data: req.body
      };
      this._config.enqueue(event, 0, [req.params.id]).then((sinks) => {
        res.status(201).send({
          'status': 'queued event',
          'event': event,
          'sinks': sinks
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
