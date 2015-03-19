var extname = require('path').extname
  , exists  = require('fs').existsSync
  , basename = require('path').basename
  , browserify = require('browserify')
  , debug = require('debug')('browserify-dev-middleware');

module.exports = function(options) {
  return function(req, res, next) {
    if (extname(req.url) == '.js') {
      debug("Bundling " + req.url);
      var b = browserify({
        insertGlobals: true,
        noParse: (options.noParse || []).map(function(lib) {
          return require.resolve(lib);
        })
      });
      var path = options.src + req.url;
      if (!exists(path))
        path = options.src + req.url.replace('.js', '') + '.coffee';
      if (exists(path)) {
        b.add(path);
      } else {
        return next();
      }
      (options.transforms || []).forEach(function(t) {
        b.transform(t);
      });
      (options.globalTransforms || []).forEach(function(t) {
        b.transform({ global: true }, t);
      });
      if (options.intercept) options.intercept(b);
      b.bundle(function(err, text) {
        if (err) {
          console.warn(err.message);
          res.send("alert(\"BROWSERIFY COMPILE ERROR (check your console for more details): " +
                   err.message + "\");");
        } else {
          debug("Finished bundling " + req.url);
          res.send(text.toString());
        }
      });
    } else {
      return next();
    }
  }
};