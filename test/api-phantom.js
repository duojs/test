
var support = require('./support');
var request = require('co-request');
var path = require('path').join;
var assert = require('assert');
var Runner = require('..');

describe('api - phantomjs', function(){
  it('should fail', function*(){
    var runner = Runner(__dirname + '/../');
    var buf = '';

    runner.app.path('/test/fixtures/simple-fail/test');
    runner.stdout = support.pass();
    runner.stderr = support.pass();

    runner.stdout.on('data', function(c){ buf += c; });
    runner.stderr.on('data', function(c){ buf += c; });
    var code = yield runner.phantomjs();

    // TODO: exact tests, and make sure phantomjs doesn't output it's usual junk.
    assert(~buf.indexOf('should succeed'));
    assert(~buf.indexOf('should fail'));
    assert(~buf.indexOf('Error: got : false'));

    // since tests failed.
    assert.equal(1, code);
  })

  it('should succeed', function*(){
    var runner = Runner(__dirname + '/../');
    var buf = '';

    runner.app.path('/test/fixtures/simple-success/test');
    runner.stdout = support.pass();
    runner.stderr = support.pass();

    runner.stdout.on('data', function(c){ buf += c; });
    runner.stderr.on('data', function(c){ buf += c; });
    var code = yield runner.phantomjs();

    assert.equal(0, code);
    // TODO: exact tests, and make sure mocha-phantomjs doesn't output it's usual junk.
    assert(~buf.indexOf('should succeed'));
  })

  it('should pass args to phantomjs', function*(){
    var runner = Runner(__dirname + '/../');
    var buf = '';

    runner.app.path('/test/fixtures/simple-success/test');
    runner.stdout = support.pass();
    runner.stderr = support.pass();

    runner.stdout.on('data', function(c){ buf += c; });
    runner.stderr.on('data', function(c){ buf += c; });
    var code = yield runner.phantomjs(['-R', 'json']);
    assert.equal(0, code);
    assert(JSON.parse(buf.trim()).stats);
  })
})
