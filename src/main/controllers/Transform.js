import bunyan from 'bunyan';
import express from 'express';

const logger = bunyan.createLogger({name: 'TransformController'});

export default class Transform {
  constructor(server, router = express.Router()) {
    this._server = server;
    this._router = router;
  }

  bind() {
    this._router.get('/', this.getAll.bind(this));
    this._router.get('/:id', this.getOne.bind(this));
    this._router.post('/:id/event', this.createEvent.bind(this));
    this._router.get('/:id/event/:eventid', this.getEvent.bind(this));
    return this._router;
  }

  getAll(req, res) {
    this._server.stats.counter('server.endpoint.transform');
    logger.debug('Getting all transforms.');

    res.status(200).send(this._server.transforms);
  }

  getOne(req, res) {
    const transformId = req.params.id;

    this._server.stats.counter(`server.endpoint.transform.${transformId}`);
    logger.debug('Getting transform %s.', transformId);

    const transform = this._server.transforms.filter(trans => trans.id == transformId);
    if (transform.length) {
      res.status(200).send(transform);
    } else {
      res.status(404).send([]);
    }
  }

  createEvent(req, res) {
    const transform = req.params.id;

    this._server.stats.counter(`server.endpoint.transform.${transform}.event`);
    logger.debug('Creating webhook event for transform %s.', transform);

    this._server.queues.add(req.body, 0, [transform]).then(events => {
      res.status(201).send(events);
    });
  }

  getEvent(req, res) {
    const transform = req.params.id;
    const event = req.params.eventid;

    this._server.stats.counter(`server.endpoint.transform.${transform}.event.${event}`);
    logger.debug('Getting event %s from transform %s.', event, transform);

    this._server.queues.get(event, transform).then(jobs => {
      if (jobs && jobs.length) {
        logger.info('Found %s events matching id %s.', jobs.length, event, {jobs});
        res.status(200).send(jobs);
      } else {
        logger.debug('Found no events matching id %s.', event);
        res.status(404).send([]);
      }
    });
  }
}
