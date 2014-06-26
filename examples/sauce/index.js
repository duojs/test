
var co = require('co');
var Runner = require('../../');
var runner = Runner(__dirname);
var Saucelabs = require('../../lib/saucelabs');

// set those

var SAUCE_USER = process.env.SAUCE_USER;
var SAUCE_KEY = process.env.SAUCE_KEY;

// Works with all reporters i've tried.

var Reporter = require('mocha').reporters.Dot;

// setup the internal server.
runner.app.path('test');

// setup saucelabs
var sauce = Saucelabs(runner.app, SAUCE_USER, SAUCE_KEY);

// each client corresponds to a browser
sauce.on('client', function(client){
  var b = client.browser;
  var spec = new Reporter(client.runner);
  client.runner.on('start', function(){
    console.log('%s %s - %s: ', b.name, b.version, b.platform);
  });
});

// add browsers and start the tests.
co(function*(){
  sauce.add('safari');
  sauce.add('chrome');
  sauce.add('firefox');
  sauce.add('ie6...11');
  yield sauce.start();
})(done);

function done(err){
  if (err) throw err;
}
