
describe('one', function(){
  describe('something', function(){
    it('should succeed', function(){});
    it('should succeed', function(){});
    it('should succeed', function(){});
    it('should succeed', function(){});
  })

  describe('something', function(){
    it('should fail', function(){ throw new Error('err') });
    it('should fail', function(){ throw new Error('err') });
    it('should fail', function(){ throw new Error('err') });
    it('should fail', function(){ throw new Error('err') });
  })
});
