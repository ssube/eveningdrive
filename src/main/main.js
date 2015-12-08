/**
 * Entry point to launch the server and fork out sub processes.
 */

import logger from 'winston';
import Promise from 'bluebird';

import Config from './server/Config';
import Manager from './server/Manager';
import Server from './server/Server';
import Worker from './server/Worker';

// Configure libraries
Promise.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true
});

// Load config
const configName = process.env['ED_CONFIG'] || './config.json';
logger.info('Loading config from: %s', configName);
const config = Config.loadFrom(configName);
logger.debug('Config loaded.');

// Fork or specialize
let serviceType;
if (cluster.isMaster) {
  logger.info('Launching manager process.');
  serviceType = Manager;
} else {
  let {role: WORKER_ROLE, id: WORKER_ID} = process.env;
  logger.info('Launching worker process %i in role: %s', id, role);
  if (role === 'worker') {
    serviceType = Worker;
  } else if (role === 'server') {
    serviceType = Server;
  } else {
    logger.error('Unknown process role: %s', role);
  }
}

// Launch
let service = serviceType.start(config);

// Handle Ctrl-C or system kills
process.on('SIGINT', () => {
  logger.info('Caught SIGINT, terminating service.');
  service.cancel();
  config.close();
});
