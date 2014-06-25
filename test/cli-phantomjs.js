
var command = require('./support').command;
var assert = require('assert');

describe('cli - phantomjs', function(){
  it('should fail +phantomjs', function*(){
    var ret = yield command('duo-test', '--path test/fixtures/simple-fail/test phantomjs');
    assert(~ret.out.indexOf('got : false'), 'expected stdout to include "got : false"');
    assert.equal(1, ret.code);
  });

  it('should fail -phantomjs', function*(){
    var ret = yield command('duo-test', '--path test/fixtures/simple-fail/test');
    assert(~ret.out.indexOf('got : false'), 'expected stdout to include "got : false"');
    assert.equal(1, ret.code);
  });

  it('should succeed +phantomjs', function*(){
    var ret = yield command('duo-test', '--path test/fixtures/simple-success/test phantomjs');
    assert(~ret.out.indexOf('should succeed'), 'expected stdout to include "should succeed"');
    assert.equal(0, ret.code);
  })

  it('should succeed -phantomjs', function*(){
    var ret = yield command('duo-test', '--path test/fixtures/simple-success/test');
    assert(~ret.out.indexOf('should succeed'), 'expected stdout to include "should succeed"');
    assert.equal(0, ret.code);
  })
})
