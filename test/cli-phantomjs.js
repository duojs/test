
var command = require('./support').command;
var assert = require('assert');
var fs = require('co-fs');

describe('cli - phantomjs', function(){
  it('should fail', function*(){
    var ret = yield command('duo-test', 'phantomjs test/fixtures/simple-fail/test');
    assert(~ret.out.indexOf('got : false'), 'expected stdout to include "got : false"');
    assert.equal(1, ret.code);
  });

  it('should succeed', function*(){
    var ret = yield command('duo-test', 'phantomjs test/fixtures/simple-success/test');
    assert(~ret.out.indexOf('should succeed'), 'expected stdout to include "should succeed"');
    assert.equal(0, ret.code);
  })

  it('should pass args to phantomjs', function*(){
    var ret = yield command('duo-test', 'phantomjs test/fixtures/simple-success/test args: -R json');
    assert(JSON.parse(ret.out).stats, 'expected -R json to be passed to phantomjs');
  })
})
