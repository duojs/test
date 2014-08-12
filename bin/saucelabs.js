
/**
 * Module dependencies.
 */

var Saucelabs = require('../lib/saucelabs');
var Queue = require('queue-component');
var pascal = require('to-pascal-case');
var buffer = require('buffer-events');
var assert = require('assert');
var mocha = require('mocha');
var env = process.env;

/**
 * Command
 */

module.exports = function*(cmd, dt){
  var reporter = pascal(cmd.parent.reporter);
  var Reporter = mocha.reporters[reporter];
  var q = new Queue({ concurrency: 1 });
  var browsers = cmd.browsers;
  var user = cmd.user;
  var key = cmd.key;
  var failures = 0;

  // validate
  assert(browsers.length, '--browser missing');
  assert(Reporter, '--reporter "' + reporter + '" was not found in mocha.reporters');
  assert(user, '--user must be given');
  assert(key, '--key must be given');

  // sauce
  var sauce = Saucelabs(dt.app, user, key);

  // report
  sauce.on('browser', function(browser){
    var runner = browser.runner;
    var flush = buffer(runner);

    function start(){
      console.log();
      console.log('  > %s', browser);
      console.log();
    }

    function end(done){
      return function(obj){
        failures = obj.failures;
        done();
      };
    }

    q.push(function(done){
      setImmediate(flush);
      runner.once('end', end(done));
      runner.once('ping', start);
      new Reporter(runner);
    });
  });

  // debug mode
  if (env.DEBUGMODE) {
    var url = yield sauce.debug();
    console.log();
    console.log('  debug on %s', url);
    console.log();
    return;
  }

  // start
  browsers.forEach(sauce.add.bind(sauce));
  yield sauce.run();
  sauce.app.destroy();
  process.exit(failures);
};
