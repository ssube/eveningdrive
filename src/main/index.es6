import cluster from 'cluster';
// Load up the app
import Server from './Server';
import Worker from './Worker';

// Load the config
import config from 'config';

if (cluster.isMaster) {
  var server = new Server(config);
  server.start();
} else {
  var worker = new Worker(config);
  worker.start();
}
