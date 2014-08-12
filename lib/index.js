
/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;
var debug = require('debug')('duo-test');
var Saucelabs = require('./saucelabs');
var exists = require('co-fs').exists;
var thunkify = require('thunkify');
var serve = require('co-static');
var join = require('path').join;
var assert = require('assert');
var exec = require('co-exec');
var koa = require('koa');

/**
 * Thunkify open.
 */

var open = thunkify(require('open'));

/**
 * Bins.
 */

var bins = join(__dirname, '..', 'node_modules', '.bin');

/**
 * Expose `DuoTest`.
 */

module.exports = DuoTest;

/**
 * Initialize `DuoTest`.
 *
 * @param {String} root
 * @api public
 */

function DuoTest(root){
  if (!(this instanceof DuoTest)) return new DuoTest(root);
  assert(root, 'root module path must be given');
  this.stdout = process.stdout;
  this.stderr = process.stderr;
  this.pathname('/test');
  this.root = root;
  this.app = koa();
  this.app.use(serve(this.root, { defer: true }));
}

/**
 * Set your test title.
 *
 * This will be used in the default.html (if used)
 * and will appear in saucelabs UI.
 *
 * @param {String} title
 * @return {String|DuoTest}
 * @api public
 */

DuoTest.prototype.title = function(title){
  if (0 == arguments.length) return this._title;
  this.title = title;
  return this;
};

/**
 * Set your tests path.
 *
 * This will be used in the app, for example
 * if your directory structure is:
 *
 *    - module
 *      - index.js
 *      - tests
 *        - test.js
 *        - index.html
 *
 * The path should be `/tests` since the app
 * is started from ./module and not ./tests
 *
 * @param {String} pathname
 * @return {String}
 * @api public
 */

DuoTest.prototype.pathname = function(pathname){
  if (0 == arguments.length) return this._pathname;
  pathname = normalize(pathname);
  this._pathname = pathname;
  return this;
};

/**
 * Get the url.
 *
 * @return {String}
 * @api private
 */

DuoTest.prototype.url = function(){
  var path = this.pathname();
  return this.tunnel
    ? fmt('%s%s', this.tunnel.url, path)
    : fmt('http://localhost:%s%s', this.address.port, path);
};

/**
 * Expose the app using localtunnel.
 *
 * @return {DuoTest}
 * @api public
 */

DuoTest.prototype.expose = function(){
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
 * Execute `cmd` as middleware.
 *
 * @param {String} cmd
 * @return {DuoTest}
 * @api private
 */

DuoTest.prototype.command = function(cmd){
  var root = this.root;
  var app = this.app;

  app.use(function* command(next){
    if (this.path != app.path()) return (yield next);
    debug('exec %s', cmd);
    yield exec(cmd, { cwd: root });
    yield next;
  });

  return this;
};

/**
 * Listen on `port`.
 *
 * @return {DuoTest}
 * @api public
 */

DuoTest.prototype.listen = function(port){
  this.server = http.createServer(this.app.callback());
  var self = this;

  return function(done){
    self.server.listen(port, function(){
      if (err) return done(err);
      self.address = self.server.address();
      debug('started %s', self.address.port);
      done(null, self);
    });
  };
};

/**
 * Destroy.
 *
 * @api private
 */

DuoTest.prototype.destroy = function(){
  if (this.server) this.server.close();
  if (this.tunnel) this.tunnel.close();
  this.address = null;
  this.server = null;
  this.tunnel = null;
  this.app = null;
  debug('destroyed');
  return this;
};

/**
 * Run `phantomjs` tests with `args`.
 *
 * TODO: remove, turn this into a ./browsers/phantom
 *
 * @param {Array} args
 * @api private
 */

DuoTest.prototype.phantomjs = function*(args){
  var bin = join(bins, 'mocha-phantomjs');
  var pjs = join(bins, 'phantomjs');
  yield this.start();
  args = [this.app.url()].concat(args || []);
  debug('phantomjs %j', args);
  if (!(yield exists(bin))) throw new Error('phantomjs was not found in node_modules/.bin');
  if (yield exists(pjs)) args = args.concat(['--path', pjs]);
  var proc = spawn(bin, args);
  var code = yield pipe(proc, this, 'phantomjs');
  this.app.destroy();
  return code;
};

/**
 * Run `saucelabs` tests with `user, tok, browsers`.
 *
 * TODO: remove
 *
 * @param {String} user
 * @param {String} tok
 * @param {Array} browsers
 * @api private
 */

DuoTest.prototype.saucelabs = function*(user, tok, browsers){
  var sauce = Saucelabs(this.app, user, tok);
  browsers.forEach(sauce.add.bind(sauce));
  yield sauce.start();
  this.app.destroy();
};

/**
 * Join `paths...` with `root`.
 *
 * @param {String} ...
 * @return {String}
 * @api private
 */

DuoTest.prototype.join = function(){
  var paths = [].slice.call(arguments);
  return join.apply(null, [this.root].concat(paths));
};

/**
 * Pipe `a`, `b`.
 *
 * @param {Process} a
 * @param {Process} b
 * @api private
 */

function pipe(a, b, name){
  return function(done){
    a.on('error', done);
    a.stdout.pipe(b.stdout);
    a.stderr.pipe(b.stderr);
    a.on('close', function(code){
      if (code) return done(null, code);
      done(null, 0);
    });
  };
}

/**
 * Normalize `path`.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

function normalize(path){
  if ('/' != path[0]) path = '/' + path;
  if ('/' != path.slice(-1)) path += '/';
  return path;
}
