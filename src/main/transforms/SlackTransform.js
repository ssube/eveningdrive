import https from 'https';
import bunyan from 'bunyan';

import Transform from './Transform';

export default class SlackTransform extends Transform {
  constructor(opts) {
    super(opts);

    this._attachments = this.getOption('attachments', '');
    this._channel = this.getOption('channel');
    this._icon = this.getOption('icon', ':bird:');
    this._name = this.getOption('name', 'Dispatch');
    this._text = this.getOption('text');
    this._webhook = this.getOption('webhook');
  }

  process(event, eventId) {
    const options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      hostname: 'hooks.slack.com',
      method: 'POST',
      path: `/services/${this._webhook.render(event)}`
    };

    const body = {
      channel: this._channel.render(event),
      text: this._text.render(event),
      username: this._name.render(event),
    };

    const icon = this._icon.render(event);
    if (icon[0] === ':') {
      body.icon_emoji = icon;
    } else {
      body.icon_url = icon;
    }

    const attachments = this._attachments.render(event);
    if (attachments) {
      body.attachments = attachments;
    }

    this._logger.info('Sending Slack message for event %s.', eventId, {options, body});

    return new Promise((res, rej) => {
      const req = https.request(options, (response) => {
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

      req.write(JSON.stringify(body));
      req.end();
    });
  }
}
