/**
 * Entry point to launch the server and fork out sub processes.
 */

import bunyan from 'bunyan';
import cluster from 'cluster';
import path from 'path';
import Promise from 'bluebird';

import Config from './server/Config';
import Manager from './server/Manager';
import Scheduler from './server/Scheduler';
import Server from './server/Server';
import Template from './server/Template';
import Worker from './server/Worker';

// Configure libraries
const logger = bunyan.createLogger({name: 'eveningdriver'});

// Load config
const rootPath = process.env['EVD_ROOT'] || __dirname;
logger.info('Using %s as the root directory.', rootPath);

const configName = path.join(rootPath, 'config.json');
logger.info('Loading config file %s', configName);

const config = Config.loadFrom(configName);
logger.info('Successfully loaded config.');

// Set the global log level
const level = config.log.level;
logger.info('Setting log level to %s.', level);
logger.level(level);

// Start up templating (register handlebars helpers)
Template.registerHelpers(config, rootPath);

// Fork or specialize
let serviceType;
if (cluster.isMaster) {
  logger.info('Launching manager process.');
  serviceType = Manager;
} else {
  // Launch the worker main
  let {WORKER_ROLE: role} = process.env;
  logger.info('Launching worker process %s as %s.', cluster.worker.id, role);
  if (role === 'worker') {
    serviceType = Worker;
  } else if (role === 'server') {
    serviceType = Server;
  } else if (role === 'scheduler') {
    serviceType = Scheduler;
  } else {
    logger.error('Unknown role %s for worker %s.', role, cluster.worker.id);
  }
}

// Launch
let service = serviceType.start(config, logger);
service.listen();
