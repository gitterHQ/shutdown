'use strict';

var ShutdownCoordinator = require('../lib/shutdown-coordinator');
var assert = require('assert');

describe('shutdown-coordinator', function() {
  it('should perform shutdown stages in reverse order', function(done) {
    var underTest = new ShutdownCoordinator();

    var lastCalled;

    underTest.addHandler('three', 3, function(callback) {
      assert.strictEqual(9, lastCalled);
      lastCalled = 3;
      setTimeout(callback, 1);
    });

    underTest.addHandler('nine', 9, function(callback) {
      assert.strictEqual(10, lastCalled);
      lastCalled = 9;
      setTimeout(callback, 1);
    });

    underTest.addHandler('ten', 10, function(callback) {
      assert(!lastCalled);
      lastCalled = 10;
      setTimeout(callback, 1);
    });

    underTest.shutdownGracefully(function(err) {
      if(err) return done(err);

      assert.strictEqual(3, lastCalled);
      done();
    });

  });

  it('should deal with stages that error', function(done) {
    var underTest = new ShutdownCoordinator();

    var lastCalled;

    underTest.addHandler('ten', 10, function(/*callback*/) {
      assert(!lastCalled);
      lastCalled = 10;
      throw new Error();
    });

    underTest.addHandler('nine', 9, function(callback) {
      assert.strictEqual(10, lastCalled);
      lastCalled = 9;
      callback(new Error());
    });

    underTest.addHandler('eight', 8, function(/*callback*/) {
      setTimeout(function() {
        throw new Error();
      }, 10);
      assert.strictEqual(9, lastCalled);
      lastCalled = 8;
    });

    underTest.addHandler('three', 3, function(callback) {
      assert.strictEqual(8, lastCalled);
      lastCalled = 3;
      setTimeout(callback, 1);
    });

    underTest.shutdownGracefully(function(err) {
      if(err) return done(err);

      assert.strictEqual(3, lastCalled);
      done();
    });

  });

  it('should deal with shutdown timeouts', function(done) {
    var underTest = new ShutdownCoordinator({ shutdownTimeout: 10 });

    var lastCalled;

    underTest.addHandler('ten', 10, function(callback) {
      lastCalled = 10;
      setTimeout(callback, 15);
    });

    underTest.addHandler('nine', 9, function(callback) {
      lastCalled = 9;
      setTimeout(callback, 1);
    });

    underTest.shutdownGracefully(function(err) {
      assert(!err);
      assert.strictEqual(10, lastCalled);
      done();
    });

  });


  it('should deal with stage timeouts', function(done) {
    var underTest = new ShutdownCoordinator({ stageTimeout: 10 });

    var lastCalled;

    underTest.addHandler('ten', 10, function(callback) {
      lastCalled = 10;
      setTimeout(callback, 15);
    });

    underTest.addHandler('nine', 9, function(callback) {
      assert.strictEqual(10, lastCalled);

      lastCalled = 9;
      setTimeout(callback, 1);
    });

    underTest.shutdownGracefully(function(err) {
      if(err) return done(err);
      assert.strictEqual(9, lastCalled);
      done();
    });

  });

});
