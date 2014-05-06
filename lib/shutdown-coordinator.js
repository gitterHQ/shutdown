/*jshint node:true, unused: true */
"use strict";

var Q = require('q');

function parse(key) {
  return parseInt(key, 10);
}

function ShutdownCoordinator(options) {
  this.handlers = {};
  this.shutdownHasStarted = false;
  this.shutdownTimeout = options && options.shutdownTimeout || 90000;
  this.stageTimeout = options && options.stageTimeout || 30000;
}

ShutdownCoordinator.prototype = {
  shutdownGracefully: function(exitCode) {
    if(this.shutdownHasStarted) return;
    this.shutdownHasStarted = true;

    var onCompletion;

    if(typeof exitCode === 'function') {
      onCompletion = exitCode;
    } else {
      onCompletion = function(err) {
        if(err) {
          process.exit(11);
        } else {
          process.exit(exitCode || 0);
        }
      };
    }

    return this.performNextShutdownStage()
      .timeout(this.shutdownTimeout, "Shutdown timeout")
      .nodeify(onCompletion);
  },

  performNextShutdownStage: function() {
    var keys = Object.keys(this.handlers).map(parse);

    if(keys.length === 0) {
      return;
    }

    var nextStage = Math.max.apply(Math, keys);

    var stageHandlers = this.handlers[nextStage];
    delete this.handlers[nextStage];

    var self = this;

    return Q.all(stageHandlers.map(function(handler) {
        try {
          var d = Q.defer();
          handler.handler(d.makeNodeResolver());
          return d.promise.catch(function(err) {
            console.error("Error while waiting for " + handler.name + " to complete: " + err, err);
          });
        } catch(err) {
          return Q.reject("Error while waiting for " + handler.name + " to complete: " + err);
        }
      }))
      .timeout(this.stageTimeout, "Timeout while waiting for stage " + nextStage + " to complete")
      .catch(function(err) {
        console.error("Error while waiting for stage " + nextStage + " to complete: " + err, err);
      })
      .then(function() {
        return self.performNextShutdownStage();
      });
  },

  addHandler: function(stageName, stageNumber, shutdownHandler) {
    var o = this.handlers[stageNumber];
    var h = { handler: shutdownHandler, name: stageName };

    if(!o) {
      o = [h];
      this.handlers[stageNumber] = o;
    } else {
      o.push(h);
    }
  }

};

module.exports = ShutdownCoordinator;