
/**
 * Command
 */

module.exports = function*(cmd, dt){
  var args = slice(cmd.parent.args);
  var code = yield dt.phantomjs(args);
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
