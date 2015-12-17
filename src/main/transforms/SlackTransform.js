import https from 'https';

import Transform from './Transform';

export default class SlackTransform extends Transform {
  constructor(opts, config, logger) {
    super(opts, config, logger);

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
      try {
        body.attachments = [JSON.parse(attachments)];
      } catch (e) {
        this._logger.warn(e, 'Error parsing Slack attachments for event %s', eventId, {
          attachments
        });
        return this.fail(e);
      }
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
          this._logger.debug('Received response while processing event %s.', eventId, {body});

          if (body === 'ok') {
            res({ok: true});
          } else {
            this._logger.warn('Error sending message to Slack for event %s.', eventId, {body});
            rej({ok: false});
          }
        });
      });

      req.write(JSON.stringify(body));
      req.end();
    });
  }
}
