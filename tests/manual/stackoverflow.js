/*eslint no-console: off */

var shutdown = require('../..');
shutdown.addHandler('two', 2, function(cb) {
  console.log('two');
  setTimeout(cb, 1000);
});
shutdown.addHandler('one', 1, function(cb) {
  console.log('one');
  setTimeout(cb, 1000);
});

process.on('uncaughtException', function() {
  shutdown.shutdownGracefully();
});

var domain = require('domain');
var d = domain.create();

function overflow() {
  overflow();
}

d.on('error', function() {
  shutdown.shutdownGracefully();
});

d.run(function() {
  overflow();
});
