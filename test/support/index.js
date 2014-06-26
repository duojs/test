
var PassThrough = require('stream').PassThrough;
var spawn = require('child_process').spawn;
var join = require('path').join;

exports.fixture = function(name){
  return join(__dirname, '..', 'fixtures', name);
};

exports.pass = function(){
  return new PassThrough;
};

exports.command = function(cmd, args){
  var cwd = join(__dirname, '..', '..');
  var bin = join('bin', cmd);
  if (!Array.isArray(args)) args = args.split(/ +/g);
  args = ['--harmony-generators', bin].concat(args);
  return function(done){
    var proc = spawn('node', args, { cwd: cwd });
    var ret = { out: '', err: '', code: null };
    proc.on('error', done);
    proc.stdout.on('data', function(c){ ret.out += c; });
    proc.stderr.on('data', function(c){ ret.err += c; });
    proc.on('close', function(code){
      ret.code = code;
      return done(null, ret);
    });
  };
};
