
/**
 * Module dependencies.
 */

var json = require('segmentio/json@1.0.0');
var b64 = require('forbeslindesay/base64-encode@2.0.1');

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
    var data = b64(json.stringify({
      event: name,
      object: obj,
      error: err
    }));

    var img = new Image;
    img.url = path + '.jpg?data=' + data;
  };
};
