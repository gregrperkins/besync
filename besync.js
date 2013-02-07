var async = require('async');

var funct = require('funct');

var besync = {};
besync.DEBUG = false;
var assert = require('assert');

besync.waterfall = function (cb, arr, opt_context) {
  if (besync.DEBUG) {
    assert.ok(typeof cb == "function");
    arr.forEach(function(fn) {
      assert.ok(typeof fn == "function");
    })
  }

  var context = opt_context || this;

  if (arr.length <= 1) {
    // TODO(gregp): more warning?
    return cb.call(context, null);
  }

  var fns = arr.map(function(fn) {
    return fn.bind(context);
  }.bind(this));

  // TODO(gregp): return what? requires rewrite async
  return async.waterfall.call(context, fns, cb.bind(context));
};

besync.forEach = function (_arr, _fn, _cb, opt_context) {
  if (besync.DEBUG) {
    console.log('arr: ', _arr, 'fn: ', _fn, 'cb: ', _cb);
  }

  var context = opt_context || this;
  var fn = _fn.bind(context);
  var cb = _cb.bind(context);

  // TODO(gregp): return what? requires rewrite async
  return async.forEach.call(context,
    _arr, // the array needs no modification
    fn,
    cb);
};

besync.map = function (_arr, _fn, _cb, opt_context) {
  if (besync.DEBUG) {
    console.log('arr: ', _arr, 'fn: ', _fn, 'cb: ', _cb);
  }

  var context = opt_context || this;
  var fn = _fn.bind(context);
  var cb = _cb.bind(context);

  // TODO(gregp): return what? requires rewrite async
  return async.map.call(context,
    _arr, // the array needs no modification
    fn,
    cb);
};

besync.mapper = function(_arr, _fn, opt_context) {
  return function(cb) {
    return besync.map(_arr, _fn, cb, opt_context);
  };
};

besync.any = function(_arr, _fn, _cb, opt_context) {
  return besync.map(_arr, _fn, funct.err(_cb, function(results) {
    for (var i = 0, len = results.length; i < len; i++) {
      if (results[i]) return _cb(null, true);
    }
    return _cb(null, false);
  }), opt_context)
};

/**
 * @param {Object} collector - Shared collected results
 * @param {Array.<*>} _arr - Array of inputs
 * @param {function(*, Object, Function)} _fn - Passed the input element,
 *    the output collector, and a done indicator function. Should take any
 *    actions necessary on the Object, keeping in mind that there is no
 *    thread safety between the various _fn's.
 * @param {function(Error=, Object)} _cb - Passed any errors and the collector
 * @param {Object=} opt_context - Context for the _fn and _cb's, if given.
 */
besync.collect = function (collector, _arr, _fn, _cb, opt_context) {
  return besync.forEach(_arr, function(input, done) {
    // want to pass the collector as a second parameter into every function
    return _fn(input, collector, done);
  }, _cb, opt_context)
};

// TODO(gregp): SIGNATURE GUARANTEED TO CHANGE!!! ---
besync.parallel = async.parallel;

module.exports = besync;
