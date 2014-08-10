
/**
 * Command
 */

module.exports = function*(cmd, runner){
  var args = slice(cmd.parent.args);
  var code = yield runner.phantomjs(args);
  process.exit(code);
};

/**
 * Slice phantom args
 */

function slice(args){
  var i = args.indexOf('args:');
  if (~i) return args.slice(++i);
  return [];
}
