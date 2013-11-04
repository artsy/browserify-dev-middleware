var extname = require('path').extname
  , exists  = require('fs').existsSync
  , basename = require('path').basename
  , browserify = require('browserify');

module.exports = function(options) {
  return function(req, res, next) {
    if (extname(req.url) == '.js') {
      var b = browserify()
        , path = options.src + req.url;
      if (!exists(path))
        path = options.src + req.url.replace('.js', '') + '.coffee';   
      if (exists(path)) b.add(path);
      (options.transforms || []).forEach(function(t) {
        b.transform(t);
      });
      b.bundle(function(err, text) {
        if (err) {
          res.send("alert(\"BROWSERIFY COMPILE ERROR: " + err.message + "\");");
        } else {
          res.send(text);
        }
      });
    } else {
      return next();
    }
  }
};