
/**
 * Module dependencies.
 */

var Queue = require('queue-component');
var buffer = require('buffer-events');
var assert = require('assert');
var env = process.env;

/**
 * Command
 */

module.exports = function*(cmd, dt){
  var buildNumber = cmd.number;
  var browsers = cmd.browsers;
  var Reporter = dt.Reporter;
  var visibility = cmd.public;
  var user = cmd.user;
  var key = cmd.key;
  var failures = 0;

  // validate
  assert(browsers.length, '--browser missing');
  assert(user, '--user must be given');
  assert(key, '--key must be given');

  // start
  dt.auth(user, key);

  // add
  browsers.forEach(function(browser){
    dt.add('saucelabs:' + browser);
  });

  // report
  dt.on('browser', function(browser){
    var client = browser.client();
    var runner = browser.runner;
    var flush = buffer(runner);

    function start(){
      console.log();
      console.log('  %s', browser);
      client.sauceJobUpdate({
        build: buildNumber,
        public: visibility
      }, function (err) {
        if (err) console.log(err);
      });
    }

    function end(done){
      return function(obj){
        failures += obj.failures;
        client.sauceJobStatus(failures == 0, function(err) {
          // an error here shouldn't be fatal
          if (err) console.log(err);
          done();
        });
      };
    }

    q.push(function(done){
      setImmediate(flush);
      runner.once('end', end(done));
      runner.once('ping', start);
      new Reporter(runner);
    });
  });

  // run
  yield dt.listen(cmd.parent.port);
  yield dt.expose();
  yield dt.run();
  yield dt.destroy();

  // exit
  console.log();
  process.exit(failures);
};
