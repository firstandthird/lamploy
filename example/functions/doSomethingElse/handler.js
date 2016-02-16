
var confi = require('confi');

module.exports = function(event, context) {
  console.log('TEST');
  context.complete('yes');
};
