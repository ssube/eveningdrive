import bunyan from 'bunyan';
import express from 'express';

const logger = bunyan.createLogger({name: 'EventController'});

export default class Event {
  constructor(server, router = express.Router()) {
    this._server = server;
    this._router = router;
  }

  bind() {
    this._router.get('/', this.getAll.bind(this));
    this._router.get('/:id', this.getOne.bind(this));
    return this._router;
  }

  getAll(req, res) {
    this._server.stats.counter('server.endpoint.event');
    logger.warn('Getting all events (not implemented).');

    res.status(200).send([]);
  }

  getOne(req, res) {
    const eventId = req.params.id;

    this._server.stats.counter(`server.endpoint.event.${eventId}`);
    logger.debug('Getting event %s.', eventId);

    const event = this._server.queues.get(eventId).then(events => {
      if (events && events.length) {
        logger.debug('Found %s events matching id %s.', events.length, eventId, {events});
        res.status(200).send(events);
      } else {
        logger.debug('Found no events matching id %s.', eventId);
        res.status(404).send([]);
      }
    });
  }
}
