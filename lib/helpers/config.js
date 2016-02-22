var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function(dir) {

  var currPath = path.join(dir, '.');
  
  console.log( 'config', dir, currPath );

  try {
    const yamlText = fs.readFileSync(currPath +  "/lambda.yaml", 'utf-8');
    return yaml.safeLoad(yamlText);
  } catch(e) {
    console.log('ERR', e); 
  }

  return false;

}
