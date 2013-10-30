var browserifyMiddleware = require('../');

describe('Browserify Dev Middleware', function() {
  
  it('compiles', function(done) {
    benv.setup(function(){
      should.exist(navigator.userAgent);
      should.exist(document);
      done();
    });
  });
});