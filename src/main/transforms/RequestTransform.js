import http from 'http';
import bunyan from 'bunyan';
import handlebars from 'handlebars';

import Transform from './Transform';

export default class RequestTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._host = handlebars.compile(this._opts.host);
    this._port = this._opts.port || 80;
    this._path = handlebars.compile(this._opts.path);
    this._method = this._opts.method;
  }

  process(event) {
    return new Promise((res, rej) => {
      const options = {
        hostname: this._host(event.data),
        method: this._method,
        port: this._port,
        path: this._path(event.data)
      }
      this._logger.debug('Making request while processing event %s.', event.id, options);

      const req = http.request(options, (response) => {
        const data = [];
        response.on('data', chunk => {
          data.push(chunk);
        });
        response.on('end', () => {
          const body = data.join('');
          this._logger.debug('Received response while processing event %s.', event.id, body);
          res(this.emit(body));
        });
      });
      req.end();
    });
  }
}
