# browserify-dev-middleware

Middleware to compile browserify files on request for development purpose.

## Example

Say you have a folder /assets that has a /assets/commit.js file using browserify.

````javascript
app.use(require('browserify-dev-middleware')({
  src: __dirname + '/assets'
}));
````

In your view (using [jade](https://github.com/visionmedia/jade))

````jade
html
  head
  body
    script( src='/commits.js' )
````

Browserify Dev Middleware will compile /assets/commits.js and serve it on request.

## Adding transforms

Add transforms by passing it as an option.

````javascript
app.use(require('browserify-dev-middleware')({
  src: '...',
  transforms: [require('jadeify')]
}));
````

Specify global transforms too.

````javascript
app.use(require('browserify-dev-middleware')({
  src: '...',
  globalTransforms: [require('deamdify')]
}));
````

Or pass any browserify options in

````javascript
app.use(require('browserify-dev-middleware')({
  src: '...',
  noParse: [
    require.resolve('./test/assets/jquery'),
    require.resolve('./test/assets/ember')
  ],
  insertGlobals: true
}));
````

Or intercept the bundle and act on it programatically

````javascript
app.use(require('browserify-dev-middleware')({
  src: '...',
  intercept: function(b) {
    b.add('./browser/main.js');
  }
}));
````

## Contributing

Please fork the project and submit a pull request with tests. Install node modules `npm install` and run tests with `npm test`.

## License

MIT
