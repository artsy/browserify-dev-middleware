var express = require('express')
  , request = require('superagent');

var app = express()
app.use(require('../')({
  src: __dirname + '/assets',
  transforms: [require('caching-coffeeify')]
}));

describe('browserifyMiddleware', function() {
  
  var server;

  before(function(done) { 
    server = app.listen(1234, done);
  });
  
  after(function() {
    server.close();
  });

  it('serves browserify files from the specified directory', function(done) {
    request.get('http://localhost:1234/foo.js').end(function(res){
      res.text.should.include('function(require,module,exports){');
      done()
    });
  });

  it('serves up some javascript that throws a warning when', function(done) {
    request.get('http://localhost:1234/bad.js').end(function(res){
      res.text.should.include('BROWSERIFY COMPILE ERROR:');
      done()
    });
  });

  it('compiles coffeescript too', function(done) {
    request.get('http://localhost:1234/coffee.js').end(function(res){
      res.text.should.include('MOO BAR TO THE BAZ');
      done()
    });
  });
});