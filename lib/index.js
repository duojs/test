
/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;
var debug = require('debug')('duo-test');
var Saucelabs = require('./saucelabs');
var exists = require('co-fs').exists;
var thunkify = require('thunkify');
var join = require('path').join;
var assert = require('assert');
var exec = require('co-exec');
var App = require('./app');

/**
 * Thunkify open.
 */

var open = thunkify(require('open'));

/**
 * Bins.
 */

var bins = join(__dirname, '..', 'node_modules', '.bin');

/**
 * Expose `Runner`.
 */

module.exports = Runner;

/**
 * Initialize `Runner`.
 *
 * @param {String} root
 * @param {Object} opts
 * @api public
 */

function Runner(root){
  if (!(this instanceof Runner)) return new Runner(root);
  assert(root, 'root module path must be given');
  this.app = App(root);
  this.stdout = process.stdout;
  this.stderr = process.stderr;
  this.root = root;
}

/**
 * Execute `cmd` as middleware.
 *
 * @param {String} cmd
 * @return {Runner}
 * @api private
 */

Runner.prototype.command = function(cmd){
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
 * Start the server if it's not started already.
 *
 * @return {Runner}
 * @api public
 */

Runner.prototype.start = function*(){
  if (!this.app.server) {
    yield this.app.listen();
  }

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

Runner.prototype.phantomjs = function*(args){
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

Runner.prototype.saucelabs = function*(user, tok, browsers){
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

Runner.prototype.join = function(){
  var paths = [].slice.call(arguments);
  return join.apply(null, [this.root].concat(paths));
};

/**
 * Destroy.
 *
 * @api private
 */

Runner.prototype.destroy = function(){
  this.app.destroy();
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
