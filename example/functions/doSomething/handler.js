//Module

module.exports.handler = function(event, context) {
  console.log('This is doing something');
  console.log('Arguments Passed: ');
  console.log(JSON.stringify(context, null, 2));
  context.done(null, 'And END Process.');
};
