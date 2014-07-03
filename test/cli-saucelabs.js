
var command = require('./support').command
var assert = require('assert');
var env = process.env;

assert(env.SAUCE_USER && env.SAUCE_KEY, 'expose $SAUCE_USER and $SAUCE_KEY to run the tests');

describe('cli - saucelabs', function(){
  it('should succeed', function*(){
    var ret = yield command('duo-test', [
      'saucelabs',
      'test/fixtures/sauce-success/test',
      '--user ', env.SAUCE_USER,
      '--key ', env.SAUCE_KEY,
      '--browser', 'chrome,firefox,safari,ie6..11'
    ]);

    assert(~ret.out.indexOf('safari'), 'expected saucelabs to test on safari');
    assert(~ret.out.indexOf('internet explorer 11'), 'expected saucelabs to test on internet explorer 11');
    assert(~ret.out.indexOf('internet explorer 10'), 'expected saucelabs to test on internet explorer 10');
    assert(~ret.out.indexOf('internet explorer 9'), 'expected saucelabs to test on internet explorer 9');
    assert(~ret.out.indexOf('internet explorer 8'), 'expected saucelabs to test on internet explorer 8');
    assert(~ret.out.indexOf('internet explorer 7'), 'expected saucelabs to test on internet explorer 7');
    assert(~ret.out.indexOf('internet explorer 6'), 'expected saucelabs to test on internet explorer 6');
    assert(~ret.out.indexOf('firefox'), 'expected saucelabs to test on firefox');
    assert(~ret.out.indexOf('chrome'), 'expected saucelabs to test on chrome');
    assert.equal(0, ret.code);
  })

  it('should fail', function*(){
    var ret = yield command('duo-test', [
      'saucelabs',
      'test/fixtures/sauce-fail/test',
      '--user ', env.SAUCE_USER,
      '--key ', env.SAUCE_KEY,
      '--reporter', 'spec'
    ]);

    assert(~ret.err.indexOf('noop is not defined'), 'expected an error message "noop is not defined"');
    assert.equal(5, ret.code);
  })

  it('should timeout', function*(){
    var ret = yield command('duo-test', [
      'saucelabs',
      'test/fixtures/sauce-timeout/test',
      '--user ', env.SAUCE_USER,
      '--key ', env.SAUCE_KEY,
      '--reporter', 'spec'
    ]);

    assert(~ret.out.indexOf('1) should timeout'), 'expected stdout to include "should timeout"');
    assert.equal(1, ret.code);
  })
})
