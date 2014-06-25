
/**
 * Module dependencies.
 */

var Runner = require('./');
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
    var path = program.path;
    var runner = Runner(process.cwd());
    runner.app.path(path);
    var code = yield runner.phantomjs();
    process.exit(code);
  });
};
