import express from 'express';

import Transform from './Transform';

export default function(server) {
  const router = express.Router();

  router.use('/transform', new Transform(server).bind());
  
  return router;
};
