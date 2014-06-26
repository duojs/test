
/**
 * Module dependencies.
 */

var json = require('segmentio/json@1.0.0');
var xhr = require('yields/xhr@1.0.0');

/**
 * Expose `mochasend`
 */

module.exports = mochasend;

/**
 * Initialize mochasend with `Runner`.
 *
 * @param {Runner} runner
 * @param {String} path
 * @api public
 */

function mochasend(runner, path){
  path = path || '/duo-test/mocha-events';
  runner.on('start', event('start'));
  runner.on('end', event('end'));
  runner.on('suite', event('suite'));
  runner.on('suite end', event('suite end'));
  runner.on('test', event('test'));
  runner.on('test end', event('test end'));
  runner.on('hook', event('hook'));
  runner.on('hook end', event('hook end'));
  runner.on('pass', event('pass'));
  runner.on('fail', event('fail'));
  runner.on('pending', event('pending'));
}

/**
 * Send event `name` to `path`.
 *
 * @param {String} name
 * @param {String} path
 * @return {Object}
 * @api private
 */

function event(name, path){
  return function(obj, err){
    var req = xhr();
    req.open('POST', path);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(json.stringify({
      event: event,
      object: obj,
      error: err
    }));
  };
};
