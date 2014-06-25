
describe('simple', function(){
  it('should succeed', function(){
    assert(true);
  })

  it('should fail', function(){
    assert(false);
  })

  function assert(val){
    if (!val) throw new Error('got : ' + val);
  }
})
