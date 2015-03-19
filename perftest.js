require('./')({
  src: __dirname + '/test',
  transforms: [require('caching-coffeeify')],
  noParse: ['./test/assets/jquery', './test/assets/ember']
})(
  { url: '/assets/perf.js' },
  { send: function(){
      console.log("done")
  } },
  function(){}
)