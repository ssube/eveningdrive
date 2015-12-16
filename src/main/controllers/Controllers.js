import express from 'express';

import Event from './Event';
import Transform from './Transform';

export default function(server) {
  const router = express.Router();

  router.use('/event', new Event(server).bind());
  router.use('/transform', new Transform(server).bind());

  return router;
};
