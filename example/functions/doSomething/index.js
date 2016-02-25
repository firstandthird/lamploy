//Module

module.exports.handler = function(event, context) {
  console.log('This is doing something');
  
  var n = 4;
  n  = n * 4;

  console.log(JSON.stringify(context, null, 2));
  context.done(null, 'And END Process. ' + n);
};
