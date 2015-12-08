import restify from 'restify';
import logger from 'winston';
import Promise from 'bluebird';

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
    this._server = restify.createServer();
    this._stats = config.stats;
    this.createRoutes();
  }

  createRoutes() {
    this._server.get('/', (req, res, next) => {
      this._stats.increment('server.requests');
      res.send(200, {
        'content': 'Hello World!'
      });
      return next();
    });
  }

  listen() {
    this._server.listen(this._port, () => {
      logger.info('Server listening on port %i.', this._port);
    });
  }

  close() {
    this._server.close();
  }
}
