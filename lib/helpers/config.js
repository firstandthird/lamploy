var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function(dir) {

  var currPath = path.join(dir, '.');

  try {
    const yamlText = fs.readFileSync(currPath +  "/lambda.yaml", 'utf-8');
    return yaml.safeLoad(yamlText);
  } catch(e) {
  
  }

  return false;

}
