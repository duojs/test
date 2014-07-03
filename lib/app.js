
/**
 * Module dependencies.
 */

var debug = require('debug')('duo-test:app');
var localtunnel = require('localtunnel');
var common = require('koa-common');
var thunkify = require('thunkify');
var fmt = require('util').format;
var assert = require('assert');
var http = require('http');
var koa = require('koa');

/**
 * Expose `App`
 */

module.exports = App;

/**
 * Initialize `App`
 */

function App(root, opts){
  if (!(this instanceof App)) return new App(root, opts);
  assert(root, 'root directory must be given');
  var app = this.app = koa();
  this.use = app.use.bind(app);
  this.opts = opts || {};
  this.root = root;
  this.path('/test');
  this.app.use(common.static(this.root, { defer: true }));
}

/**
 * Get the tests url.
 *
 * @return {String}
 * @api private
 */

App.prototype.url = function(){
  return this.tunnel
    ? fmt('%s%s', this.tunnel.url, this.path())
    : fmt('http://localhost:%s%s', this.address.port, this.path());
};

/**
 * Set the tests path.
 *
 * @param {String} path
 * @return {App}
 * @api private
 */

App.prototype.path = function(path){
  if (!path) return this._path;
  if ('/' != path[0]) path = '/' + path;
  if ('/' != path[path.length - 1]) path += '/';
  debug('path %s', path);
  this._path = path;
  return this;
};

/**
 * Expose the app using localtunnel.
 *
 * @return {App}
 * @api public
 */

App.prototype.expose = function(){
  var self = this;
  return function(done){
    var port = self.address.port;
    localtunnel(port, function(err, tunnel){
      if (err) return done(err);
      self.tunnel = tunnel;
      debug('localtunnel %s', tunnel.url);
      done(null, self);
    });
  };
};

/**
 * Listen.
 *
 * @param {Number} port
 * @return {App}
 * @api private
 */

App.prototype.listen = function(port){
  var opts = this.opts;
  var self = this;

  this.server = http.createServer(this.app.callback());

  return function(done){
    self.server.listen(port, function(err){
      if (err) return done(err);
      self.address = self.server.address();
      debug('started %s', self.address.port);
      done(null, self);
    });
  };
};

/**
 * Destroy
 *
 * @return {App}
 * @api private
 */

App.prototype.destroy = function(){
  this.server && this.server.close();
  this.tunnel && this.tunnel.close();
  this.address = null;
  this.server = null;
  this.tunnel = null;
  this.koa = null;
  debug('destroyed');
  return this;
};
