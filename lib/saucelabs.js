
/**
 * Module dependencies.
 */

var debug = require('debug')('duo-test:saucelabs');
var Emitter = require('events').EventEmitter;
var parallel = require('co-parallel');
var wdparse = require('wd-browser');
var thunkify = require('thunkify');
var fmt = require('util').format;
var join = require('path').join;
var assert = require('assert');
var _ = require('koa-route');
var fs = require('fs');
var wd = require('wd');

/**
 * window.saucelabs(mocha)
 */

var js = fs.readFileSync(join(__dirname, '..', 'client', 'build.js'));

/**
 * Expose `Saucelabs`
 */

module.exports = Saucelabs;

/**
 * Initialize `Saucelabs`
 *
 * @param {App} app
 * @param {String} user
 * @param {String} tok
 * @api public
 */

function Saucelabs(app, user, tok){
  if (!(this instanceof Saucelabs)) return new Saucelabs(app, user, tok);
  Emitter.call(this);
  assert(user, '"user" required');
  assert(tok, '"tok" required');
  assert(app, '"app" required');
  this.clients = {};
  this.browsers = [];
  this.user = user;
  this.tok = tok;
  this.app = app;
}

/**
 * Inherit `Emitter`
 */

Saucelabs.prototype.__proto__ = Emitter.prototype;

/**
 * Add `browser`.
 *
 * @param {String} name
 * @api public
 */

Saucelabs.prototype.add = function(name){
  debug('add %s', name);
  var all = wdparse(name);
  var self = this;

  all.forEach(function(b){
    self.browsers.push({
      name: b[0],
      version: b[1],
      platform: b[2]
    });
  });

  return this;
};

/**
 * Send the client side script.
 *
 * @return {Generator}
 * @api public
 */

Saucelabs.prototype.script = function(){
  return function*(){
    debug('sent mochasend()');
    this.type = 'js';
    this.body = js;
  };
};

/**
 * Receive mocha events.
 *
 * @return {Generator}
 * @api public
 */

Saucelabs.prototype.receive = function(){
  var self = this;
  return function*(){
    var data = new Buffer(this.query.data, 'base64').toString();
    var id = this.query.id;
    var client = self.clients[id];
    var json = JSON.parse(data);

    // edge-case
    if (!client) throw new Error('client "' + id + '" was not found');

    // HACK
    if (json.obj) {
      json.obj.slow = function(){ return this._slow; };
      json.obj.fullTitle = function(){ return this._fullTitle; };
    }

    // runner
    var runner = client.runner;

    // HACK
    if (!runner.emittedStart) {
      debug('emit start');
      runner.emittedStart = true;
      runner.emit('start');
    }

    debug('emit %s', json.event);
    runner.emit(json.event, json.obj, (json.obj || {}).err);
    var fn = this.query.callback;
    var js = fmt('this.%s && %s();', fn, fn);
    debug('sent js %s', js);
    this.type = 'js';
    this.body = js;
  };
};

/**
 * Start.
 *
 * @param {String} name
 * @api public
 */

Saucelabs.prototype.start = function*(name){
  var name = name || 'test';
  var app = this.app;
  var self = this;
  var gens = [];

  app.use(_.get('/duo-test/mocha-send.js', this.script()));
  app.use(_.get('/duo-test/mocha-events', this.receive()));
  yield app.listen();
  yield app.expose();

  this.browsers.forEach(function(b){
    gens.push(function*(){
      var conn = wd.remote('ondemand.saucelabs.com', 80, self.user, self.tok);
      conn.get = thunkify(conn.get);
      conn.init = thunkify(conn.init);

      var conf = {};
      conf.name = name;
      conf.tags = [];
      conf.browserName = b.name;
      conf.version = b.version;
      conf.platform = b.platform;
      yield conn.init(conf);

      debug('connected %s - %s#%s on %s', conf.name, conf.browserName, conf.version, conf.platform);

      var id = Date.now().toString(16);
      var client = self.clients[id] = {
        runner: new Emitter,
        browser: b,
        conn: conn,
        id: id
      };

      debug('add %s as %s', b.name, id);

      self.emit('client', client)

      try {
        var url = self.app.url();
        url += (~url.indexOf('?') ? '&' : '?') + '__id__=' + id;
        debug('get %s', url);
        yield conn.get(url);
      } catch (e) {
        debug('error %s', e);
        self.clients[id] = null;
        debug('quit %s', id);
        client.quit();
        throw e;
      }

      // TODO: co-timeout
      yield function(done){
        client.runner.once('end', function(){
          setImmediate(function(){
            debug('%s has quit', id);
            client.conn.quit();
            done();
          });
        });
      };
    });
  });

  yield parallel(gens);
  app.destroy();
};
