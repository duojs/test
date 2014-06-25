
/**
 * Module dependencies.
 */

var Runner = require('./');
var open = require('open');
var co = require('co');

/**
 * Run phantomjs using `program`.
 *
 * @param {Command} program
 * @return {Function}
 * @api public
 */

exports.phantomjs = function(program){
  return co(function*(){
    try {
      var path = program.path;
      var runner = Runner(process.cwd());
      runner.app.path(path);
      var code = yield runner.phantomjs();
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
 * Create tests directory.
 *
 * @param {Command} program
 * @return {Function}
 * @api public
 */

exports.create = function(program){
  return co(function*(){
    try {
      var root = process.cwd();
      var name = program.title;
      var build = program.build;
      var component = join(root, 'component.json');
      var tests = join(root, 'test');
      var index = join(tests, 'index.html');
      var test = join(tests, 'test.js');
      if (!name) name = require(component).name;
      if (!(yield exists(index))) yield createIndex(name, build);
      if (!(yield exists(index))) yield createTest(name);
    } catch (e) {
      error(e);
    }
  });
};

/**
 * Create Index.
 *
 * @return {String}
 * @api private
 */

function *createIndex(name, build){
  return [
    '<!doctype html>',
    '<head>'
    '  <meta charset="utf8">'
    '  <title>' + name + '</title>',
    '  <link rel="stylesheet" href="/mocha.css">',
    '  <script src="/mocha.js"></script>',
    '  <script>mocha.setup({ ui: "bdd" })',
    '</head>',
    '<body>',
    '  <script src="' + build + '"></script>',
    '  <script>',
    '    (function(){',
    '      var s = window.saucelabs || function(){};',
    '      s((window.mochaPhantomJS || mocha).run());',
    '    })();',
    '  </script>',
    '</body>',
    '</html>'
  ].join('\n');
}

/**
 * Create test
 *
 * @return {String}
 * @api private
 */

function *createTest(){
  return [
    '',
    '  describe(\'' + name + '\'\, function(){});',
    ''
  ].join('\n');
}


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
