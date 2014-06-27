
var co = require('co');
var Runner = require('../../');
var runner = Runner(__dirname);
var Saucelabs = require('../../lib/saucelabs');
var buffer = require('buffer-events');

// set those

var SAUCE_USER = process.env.SAUCE_USER;
var SAUCE_KEY = process.env.SAUCE_KEY;

// Works with all reporters i've tried.

var Reporter = require('mocha').reporters.Spec;

// setup the internal server.
runner.app.path('test');

// setup saucelabs
var sauce = Saucelabs(runner.app, SAUCE_USER, SAUCE_KEY);

// each client corresponds to a browser
sauce.on('client', function(client){
  var b = client.browser;
  var flush = buffer(client.runner);

  report(client, flush);
});

// since we get clients and reports
// in parallel we should make sure we
// output one by one, otherwise the logging
// will be awful.

function report(client, flush){
  if (report.busy) {
    return setTimeout(function(){
      report(client, flush);
    });
  }

  report.busy = true;
  var runner = client.runner;
  runner.on('end', function(){
    report.busy = false;
  });

  runner.on('start', function(){
    var b = client.browser;
    console.log('%s - %s %s', b.name, b.version, b.platform);
  });

  var reporter = new Reporter(runner);
  flush();
}

// add browsers and start the tests.
co(function*(){
  sauce.add('chrome');
  sauce.add('safari');
  sauce.add('firefox');
  yield sauce.start();
  runner.app.destroy();
})(done);

function done(err){
  if (err) throw err;
}
