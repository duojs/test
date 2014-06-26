
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
 * Client ID.
 */

var id = (function(){
  var s = window.location.search;
  if ('?' == s.charAt(0)) s = s.substr(1);
  var parts = s.split('=');
  for (var i = 0; i < parts.length; ++i) {
    if ('__id__' == parts[i]) return parts[i + 1];
  }
})();

/**
 * Initialize mochasend with `Runner`.
 *
 * @param {Runner} runner
 * @param {String} path
 * @api public
 */

function mochasend(runner, path){
  path = path || '/duo-test/mocha-events';
  runner.on('start', event('start', path));
  runner.on('end', event('end', path));
  runner.on('suite', event('suite', path));
  runner.on('suite end', event('suite end', path));
  runner.on('test', event('test', path));
  runner.on('test end', event('test end', path));
  runner.on('hook', event('hook', path));
  runner.on('hook end', event('hook end', path));
  runner.on('pass', event('pass', path));
  runner.on('fail', event('fail', path));
  runner.on('pending', event('pending', path));
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
    var img = new Image;
    img.src = path + '.jpg?id=' + id + '&data=' + b64(stringify({
      event: name,
      object: obj,
      error: err
    }));
  };
};

/**
 * Stringify circular json.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function stringify(obj){
  var c = [];
  return json.stringify(obj, function(k, v){
    if ('object' != typeof v) return v;
    if (~c.indexOf(v)) return;
    c.push(v);
    return v;
  });
}
