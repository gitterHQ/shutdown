/*jshint node:true */
"use strict";

var ShutdownCoordinator = require('./shutdown-coordinator');
var singleton = new ShutdownCoordinator();

module.exports = ['shutdownGracefully', 'addHandler'].reduce(function(memo, method) {
  memo[method] = function() {
    return singleton[method].apply(singleton, arguments);
  };

  return memo;
}, {});
