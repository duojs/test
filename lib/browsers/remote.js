
/**
 * Module dependencies.
 */

var debug = require('debug')('duo-test:remote');
var Emitter = require('events').EventEmitter;
var timeout = require('co-timeout');
var thunkify = require('thunkify');
var assert = require('assert');
var wd = require('wd');

/**
 * Expose `Remote`
 */

module.exports = Remote;

/**
 * Initialize `Remote`
 *
 * @param {Object} conf
 * @api public
 */

function Remote(conf){
  if (!(this instanceof Remote)) return new Remote(conf);
  var self = this;
  this.id = Math.random().toString(16).slice(2);
  this.runner = new Emitter;
  this.name = conf.name;
  this.version = conf.version;
  this.platform = conf.platform;
  this.runner.once('ping', function(){
    self.ping = true;
  });
}

/**
 * Get `path`.
 *
 * @param {String} url
 * @return {Remote}
 * @api public
 */

Remote.prototype.get = function*(url){
  var client = this.client();
  var self = this;

  yield client.get(url);

  // wait 2s to `ping` event.
  yield timeout(2e3, function(done){
    if (self.ping) return done();
    self.runner.once('ping', done);
  });

  return this;
};

/**
 * Connect using `user`, `key` and test `title`.
 *
 * @param {String} title
 * @param {String} user
 * @param {String} key
 * @return {Remote}
 * @api public
 */

Remote.prototype.connect = function*(title, user, key){
  var client = this.client(user, key);
  var opts = this.options(title);
  yield client.init(opts);
  debug('%s: connect', this);
  return this;
};

/**
 * Quit.
 *
 * @return {Remote}
 * @api public
 */

Remote.prototype.quit = function(done){
  var client = this.client();
  var self = this;

  client.quit(function(err){
    if (err) return done(err);
    debug('%s: quit', self);
    done(null, self);
  });

  return this;
};

/**
 * Create wd client with `user`, `tok`.
 *
 * @param {String} user
 * @param {String} key
 * @return {Client}
 * @api public
 */

Remote.prototype.client = function(user, key){
  if (this._client) return this._client;
  assert(user, 'user must be passed to .client()');
  assert(key, 'key must be passed to .client()');
  var client = wd.remote('ondemand.saucelabs.com', 80, user, key);
  client.init = thunkify(client.init);
  client.get = thunkify(client.get);
  return this._client = client;
};

/**
 * Get connection configuration.
 *
 * @param {String} title
 * @return {Object}
 * @api private
 */

Remote.prototype.options = function(title){
  return {
    platform: this.platform,
    browserName: this.name,
    version: this.version,
    name: title,
    tags: []
  };
};

/**
 * Inspect.
 *
 * @return {String}
 * @api public
 */

Remote.prototype.toString = function(){
  return [this.name, this.version, this.platform].join(' ');
};
