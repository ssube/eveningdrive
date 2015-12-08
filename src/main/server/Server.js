import bunyan from 'bunyan';
import express from 'express';
import Promise from 'bluebird';

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
    this._port = config.server.port || 8080;
    this._app = express();
    this._stats = config.stats;
    this.createRoutes();
  }

  createRoutes() {
    this._app.get('/', (req, res) => {
      this._stats.increment('server.requests');
      res.send(200, {
        'content': 'Hello World!'
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
