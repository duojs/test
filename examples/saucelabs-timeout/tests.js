
describe('saucelabs - timeout', function(){
  it('should succeed', function(){});
  it.skip('should skip', function(){});
  it('should timeout', function(done){ setTimeout(done, 101); });
  it('should error', function(){
    throw new Error('err');
  });
});
