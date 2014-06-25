
/**
 * Module dependencies.
 */

var Runner = require('./');
var open = require('open');
var co = require('co');

/**
 * Run phantomjs using `program` and `args`
 *
 * @param {Command} program
 * @param {Array} args
 * @return {Function}
 * @api public
 */

exports.phantomjs = function(program, args){
  return co(function*(){
    try {
      var path = program.path;
      var runner = Runner(process.cwd());
      runner.app.path(path);
      var code = yield runner.phantomjs(args);
      process.exit(code);
    } catch (e) {
      error(e);
    }
  });
};

/**
 * Run in `browser` using `program`.
 *
 * @param {Command} program
 * @param {String} browser
 * @return {Function}
 * @api public
 */

exports.browser = function(program, browser){
  if ('ie' == browser) browser = 'internet explorer';
  if ('chrome' == browser) browser = 'google chrome';

  return function(){
    var runner = Runner(process.cwd());
    runner.app.path(program.path);
    runner.start = co(runner.start);
    runner.start(function(err){
      if (err) error(err);
      var url = runner.app.url();
      open(url, browser, function(err){
        if (err) error(err);
        console.log();
        console.log('  %s started on %s', browser, url);
        console.log();
      });
    });
  };
};

/**
 * Error
 */

function error(err){
  if (err) {
    console.error();
    console.error('  %s', err.stack || err);
    console.error();
    process.exit(2);
  }
}
