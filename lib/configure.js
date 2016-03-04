'use strict';

const fs = require('fs');
const path = require('path');

const async = require('async');
const _ = require('lodash');
const glob = require('glob');
const dotenv = require('dotenv');
const yaml = require('js-yaml');

module.exports = (functionList, opts, done) => {
 
  if(opts.envFile && !_.isArray(opts.envFile)) {
    opts.envFile = [opts.envFile];
  }

  if(opts.envVars && !_.isArray(opts.envVars)) {
    opts.envVars = [opts.envVars];
  }

  const confFiles = opts.envFile || [];

  async.auto({
    buildConfig: (cb, results) => {
      
      let configObj = _.reduce(confFiles, (map, file) => {
        let config = dotenv.parse( fs.readFileSync(file));
        map = _.defaults({}, map, config);
        return map;
      }, {});
      
      console.log(configObj);

      configObj = _.reduce(opts.envVars, (map, varStr) => {
        let config = dotenv.parse( varStr );
        map = _.defaults({}, map, config);
        return map;
      }, configObj);

      cb(null, configObj);
    },
    writeConfigs: ['buildConfig', (cb, results) => {
      const newText = [
        '// Injected for config purposes'
      ];  
      for(let k in results.buildConfig) {
        newText.push('process.env["' + k + '"]=' + JSON.stringify(results.buildConfig[k]) + ";");
      }
      
      newText.push('// END--');
     
      async.forEachOf(functionList, (funcDir, key, acb) => {

        let handler = funcDir.mainFile || 'handler.js';

        let fileContents = fs.readFileSync( path.join(funcDir._tempDir, handler), {encoding: 'utf-8'});
        let fileArr = fileContents.split("\n");
        
        let startPoint = 0;
        if(fileArr[0] === "'use strict';") {
          startPoint = 1;
        }

        var args = [startPoint, 0].concat(newText);

        Array.prototype.splice.apply(fileArr, args);

        fs.writeFile(path.join(funcDir._tempDir, handler), _.join(fileArr, "\n"), (err) => {
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
