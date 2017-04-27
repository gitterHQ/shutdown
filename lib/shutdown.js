'use strict';

var ShutdownCoordinator = require('./shutdown-coordinator');
var singleton = new ShutdownCoordinator();
singleton.listen();

process.once('SIGINT', function() {
  // Node exits with 130 on SIGINT
  process.emit('gracefulShutdown', 130);
});

process.once('SIGTERM', function() {
  process.emit('gracefulShutdown', 0);
});

module.exports = ['addHandler'].reduce(function(memo, method) {
  memo[method] = function() {
    return singleton[method].apply(singleton, arguments);
  };

  return memo;
}, {
  shutdownGracefully: function(exitCode) {
    // Using this approach means that any other versions of shutdown used by submodules
    // will also get the message
    process.emit('gracefulShutdown', exitCode);
  }
});
