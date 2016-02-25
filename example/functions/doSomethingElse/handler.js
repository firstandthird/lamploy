
var confi = require('confi');

module.exports.handler = function(event, context) {
  var n = 4;
  n = n + 4;

  console.log('TEST');
  context.done(null, 'yes ' + n);
};
