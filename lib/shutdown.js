/*jshint node:true */
"use strict";

var ShutdownCoordinator = require('./shutdown-coordinator');
var singleton = new ShutdownCoordinator();

module.exports = ['shutdownGracefully', 'addHandler'].map(function(method) {
  return function() {
    return singleton[method].apply(singleton, arguments);
  };
});
