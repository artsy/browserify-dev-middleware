var PrettyError = require('pretty-error');
var _ = require('underscore');
var basename = require('path').basename;
var beep = require('beepbeep')
var browserify = require('browserify');
var errorify = require('errorify');
var debug = require('debug')('browserify-dev-middleware');
var extname = require('path').extname;
var fs = require('fs');
var notifier = require('node-notifier')
var watchify = require('watchify');

var pe = new PrettyError();

var watchers = {};
var cached = {};

var bundleAndCache = function(w, path) {
  w.bundle(function(err, src) {
    if (err) {
      cached[path] = `
        if (typeof window !== 'undefined') {
          console.warn('Error bundling file: ${path}')
          console.error('${err.message}')
        }
      `

      console.log(pe.render(new Error(err.message)));

      notifier.notify({
        'title': 'Browserify compile error!',
        'message': 'Check terminal console for more info.'
      });

      beep(2);
      w.emit('error');
    } else {
      cached[path] = src.toString();
      console.log('Bundled: ' + path);
    }
  });
}

module.exports = function(options) {
  return function(req, res, next) {
    if (extname(req.url) == '.js') {
      debug("Bundling " + req.url);

      // Make sure the source file exists
      var path = options.src + req.url;
      fs.exists(path, function(exists) {
        if (!exists) path = options.src + req.url.replace('.js', '.coffee');
        fs.exists(path, function(exists) {
          if (!exists) return next();

          var w;

          // Create a new bundle & watcher if we haven't done so. Then start
          // and initial bundling.
          if (!watchers[path]) {
            var b = browserify(_.extend(_.omit(options,
              'transforms', 'globalTransforms', 'src'
            ), watchify.args));

            b.add(path);
            b.plugin(errorify);

            const transforms = options.transforms || [];
            transforms.forEach(function(t) {
              b.transform(t);
            });

            const globalTransforms = options.globalTransforms || [];
            globalTransforms.forEach(function(t) {
              b.transform({ global: true }, t);
            });

            if (options.intercept) options.intercept(b);
            w = watchers[path] = watchify(b);
            bundleAndCache(w, path);
            // Re-bundle & cache the output on file change
            w.on('update', function() {
              cached[path] = null;
              bundleAndCache(w, path);
            });
          } else {
            w = watchers[path];
          }

          // Serve cached asset if it hasn't change
          if (cached[path]) {
            debug("Finished bundling " + req.url);
            res.send(cached[path]);
          } else {
            var end = _.once(function() {
              setTimeout(function() {
                debug("Finished bundling " + req.url);
                res.send(cached[path]);
              });
            });
            w.once('time', end) //.once('error', end);

            // Don't exit process on error so that we can fix and continue
            w.on('error', function(err) {})
          }
        });
      });
    } else {
      return next();
    }
  }
};
