/*jshint node:true, unused: true */
"use strict";

var async = require('async');
var domain = require('domain');

function ShutdownCoordinator(options) {
  this.handlers = {};
  this.shutdownHasStarted = false;
  this.shutdownTimeout = options && options.shutdownTimeout || 15000;
  this.stageTimeout = options && options.stageTimeout || 10000;
}

ShutdownCoordinator.prototype = {
  listen: function() {
    var self = this;
    process.once('gracefulShutdown', function(exitCode) {
      self.shutdownGracefully(exitCode);
    });
  },

  shutdownGracefully: function(exitCode) {
    var self = this;
    process.nextTick(function() {
      self.shutdownGracefullyImmediate(exitCode);
    });
  },

  shutdownGracefullyImmediate: function(exitCode) {
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

    function completionOnce() {
      if(!onCompletion) return;
      var tempOnCompletion = onCompletion;
      onCompletion = null;
      tempOnCompletion();
    }

    var levels = Object.keys(this.handlers).map(function(level) {
      return parseInt(level, 10);
    });

    /* Reverse order */
    levels.sort(function(a, b) {
      return b - a;
    });

    var stageTimeout = this.stageTimeout;
    var handlers = this.handlers;

    var shutdownTimer = setTimeout(function() {
      completionOnce(new Error("Timeout"));
    }, this.shutdownTimeout);
    shutdownTimer.unref();

    var shutdownSequence = levels.map(function(level) {
      var stageHandlers = handlers[level];

      return function(stageCallback) {
        async.parallel(stageHandlers.map(function(handler) {
          return function(handlerCallback) {
            var st;

            var d = domain.create();
            d.on('error', function(err) {
              clearTimeout(st);

              console.error(handler.name + " handler failed during shutdown: " + err);
              handlerCallback();
            });

            d.run(function() {
              // Stage timeout
              var st = setTimeout(function() {
                console.error(handler.name + " shutdown handler did not complete in a timely manner");
                if(handlerCallback) {
                  handlerCallback();
                }
              }, stageTimeout);
              st.unref();

              // Call the handler
              try {
                handler.handler(function(err) {
                  if(err) {
                    console.error(handler.name + " handler failed during shutdown: " + err);
                  }

                  clearTimeout(st);
                  handlerCallback();
                });
              } catch(e) {
               clearTimeout(st);
               handlerCallback();
              }
            });

          };
        }), function(err) {
          /* err should never happen, but anyway */
          if(err) {
            console.error('Unexpected error during shutdown: ' + err);
          }

          stageCallback();
        });
      };
    });

    async.series(shutdownSequence, function(err) {
      /* err should never happen, but anyway */
      if(err) {
        console.error('Unexpected error during shutdown: ' + err);
      }
      clearTimeout(shutdownTimer);
      completionOnce();
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