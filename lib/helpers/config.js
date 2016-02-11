var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function(dir, cb) {

  var currPath = path.join(dir, '.');

  fs.readFile( currPath +  "/lambda.yaml", 'utf-8', function(err, data) {
    if(err) {
      cb(err);
      return;
    }

    cb(null, yaml.safeLoad(data));
  });

}
