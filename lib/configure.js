'use strict';

const fs = require('fs');
const path = require('path');

const async = require('async');
const _ = require('lodash');
const glob = require('glob');
const dotenv = require('dotenv');
const yaml = require('js-yaml');

module.exports = (functionList, opts, done) => {
  async.auto({
    getConfigFiles: (cb) => {
      glob("conf/**.env", (err, files) => {
        if(err) {
          return cb(err);
        }

        cb(null, files);
      });
    },
    buildConfig: ['getConfigFiles', (cb, results) => {
      let configObj = _.reduce(results.getConfigFiles, (map, file) => {
        let config = dotenv.parse( fs.readFileSync(file));
        map = _.defaults({}, map, config);
        return map;
      }, {});

      cb(null, configObj);
    }],
    writeConfigs: ['buildConfig', (cb, results) => {
      const newText = [
        '// Injected for config purposes'
      ];  
      for(let k in results.buildConfig) {
        newText.push('process.env["' + k + '"]=' + JSON.stringify(results.buildConfig[k]) + ";");
      }
      
      newText.push('// END--');
     
      async.each(functionList, (funcDir, acb) => {

        let lambdaFile = path.join(funcDir, 'lambda.yaml');
        let funcConf = yaml.safeLoad( fs.readFileSync(lambdaFile));

        let handler = funcConf.handler || 'handler.js';

        let fileContents = fs.readFileSync( path.join(funcDir, handler), {encoding: 'utf-8'});
        let fileArr = fileContents.split("\n");
        
        let startPoint = 0;
        if(fileArr[0] === "'use strict';") {
          startPoint = 1;
        }

        var args = [startPoint, 0].concat(newText);

        Array.prototype.splice.apply(fileArr, args);

        fs.writeFile(path.join(funcDir, handler), _.join(fileArr, "\n"), (err) => {
          acb(err);
        }); 
      }, (err) => {
        cb(null, true);
      }); 
    }]
  }, (err, results) => {
    done(null);
  });
};
