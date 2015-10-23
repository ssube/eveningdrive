var cluster = require('cluster');
var driver = require('./target/pack/server.bundle.js');
var config = require('./config');

if (cluster.isMaster) {
  var server = new driver.Server(config);
  server.start();
} else {
  var worker = new driver.Worker(config);
  worker.start();
}
