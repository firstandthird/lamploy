'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = function(dir, file) {

  let fileName = file || 'lambda.yaml';

  let currPath = path.join(dir, '.');
  
  try {
    const yamlText = fs.readFileSync(currPath +  "/" + fileName, 'utf-8');
    return yaml.safeLoad(yamlText);
  } catch(e) {
  
  }

  return {};

}
