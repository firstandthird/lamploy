var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function(dir, file) {

  var fileName = file || 'lambda.yaml';

  var currPath = path.join(dir, '.');
  
  try {
    const yamlText = fs.readFileSync(currPath +  "/" + fileName, 'utf-8');
    return yaml.safeLoad(yamlText);
  } catch(e) {
    console.log('Configuration ERR', e); 
  }

  return false;

}
