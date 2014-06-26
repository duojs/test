
/**
 * Module dependencies.
 */

var debug = require('debug')('duo-test:saucelabs');
var Emitter = require('events').EventEmitter;
var parallel = require('co-parallel');
var wdparse = require('wd-browser');
var thunkify = require('thunkify');
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
    debug('got %j', this.query);
    var data = new Buffer(this.query.data, 'base64').toString();
    var id = this.query.id;
    var client = self.clients[id];
    var json = JSON.parse(data);

    // edge-case
    if (!client) throw new Error('client "' + id + '" was not found');

    // HACK
    if (json.object) json.object.slow = function(){ return 2000; };

    // runner
    var runner = client.runner;

    // HACK
    if (!runner.emittedStart) {
      runner.emittedStart = true;
      runner.emit('start');
    }

    debug('%s - emit %s %j', id, json.event, json.object);
    runner.emit(json.event, json.object, json.error);
    this.type = 'jpg';
    this.body = '';
  };
};

/**
 * Start.
 *
 * @api public
 */

Saucelabs.prototype.start = function*(){
  var app = this.app;
  var self = this;
  var gens = [];

  app.use(_.get('/duo-test/mocha-send.js', this.script()));
  app.use(_.get('/duo-test/mocha-events.jpg', this.receive()));
  yield app.listen();
  yield app.expose();

  this.browsers.forEach(function(b){
    gens.push(function*(){
      debug('connect %s, %s, %s', b.name, b.version, b.platform);
      var conn = wd.remote('ondemand.saucelabs.com', 80, self.user, self.tok);
      conn.get = thunkify(conn.get);
      conn.init = thunkify(conn.init);

      yield conn.init({
        name: 'test',
        tags: []
      });

      var id = Date.now().toString(16);
      var client = self.clients[id] = {
        runner: new Emitter,
        browser: b,
        conn: conn,
        id: id
      };

      debug('add %s as %s', b.name, id);

      client.runner.once('end', function(){
        debug('%s has quit', id);
        client.conn.quit();
      });

      self.emit('client', client)

      try {
        var url = self.app.url();
        url += (~url.indexOf('?') ? '&' : '?') + '__id__=' + id;
        debug('get %s', url);
        yield conn.get(url);
        conn.quit();
      } catch (e) {
        self.clients[id] = null;
        self.clients[id].quit();
      }
    });
  });

  yield parallel(gens);
  app.destroy();
};
