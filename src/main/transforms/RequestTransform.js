import http from 'http';
import bunyan from 'bunyan';
import handlebars from 'handlebars';

import Transform from './Transform';
import Template from '../server/Template';

export default class RequestTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._host = new Template(this._opts.host);
    this._port = new Template(this._opts.port || '80');
    this._path = new Template(this._opts.path);
    this._method = new Template(this._opts.method);
  }

  process(event, eventId) {
    return new Promise((res, rej) => {
      const options = {
        hostname: this._host.render(event),
        method: this._method.render(event),
        port: this._port.render(event),
        path: this._path.render(event)
      }
      this._logger.debug('Making request while processing event %s.', eventId, options);

      const req = http.request(options, (response) => {
        const data = [];
        response.on('data', chunk => {
          data.push(chunk);
        });
        response.on('end', () => {
          const body = data.join('');
          this._logger.debug('Received response while processing event.', eventId, body);
          res(this.emit(body));
        });
      });
      req.end();
    });
  }
}
