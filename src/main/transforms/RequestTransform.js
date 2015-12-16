import http from 'http';
import https from 'https';
import bunyan from 'bunyan';

import Transform from './Transform';

export default class RequestTransform extends Transform {
  constructor(opts) {
    super(opts);
    this._host = this.getOption('host');
    this._port = this.getOption('port', '80');
    this._protocol = this.getOption('protocol', 'http');
    this._path = this.getOption('path', '/');
    this._method = this.getOption('method', 'GET');

    if (this._opts.body) {
      this._body = this.getOption('body');
    }
  }

  process(event, eventId) {
    const protocol = this._protocol.render(event);
    let protocolHandler;
    switch (protocol) {
      case 'http':
        protocolHandler = http;
        break;
      case 'https':
        protocolHandler = https;
        break;
      default:
        this._logger.warn('Unknown protocol %s in event %s.', protocol, eventId);
        rej(new Error('Unknown protocol.'));
        break;
    }

    const options = {
      hostname: this._host.render(event),
      method: this._method.render(event),
      port: this._port.render(event),
      path: this._path.render(event)
    }

    this._logger.debug('Making request while processing event %s.', eventId, options);
    return new Promise((res, rej) => {
      const req = protocolHandler.request(options, (response) => {
        const data = [];
        response.on('error', e => {
          this._logger.warn(e, 'Error making request while processing event %s.', eventId);
        });
        response.on('data', chunk => {
          data.push(chunk);
        });
        response.on('end', () => {
          const body = data.join('');
          this._logger.debug('Received response while processing event %s.', eventId, body);

          try {
            const parsedBody = JSON.parse(body);
            res(parsedBody);
          } catch (e) {
            this._logger.warn(e, 'Error parsing response while processing event %s.', eventId, {
              response: body
            });
            rej(e);
          }
        });
      });

      if (this._body) {
        req.write(this._body.render(event));
      }

      req.end();
    });
  }
}
