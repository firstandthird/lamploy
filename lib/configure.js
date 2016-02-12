'use strict';

const fs = require('fs');
const path = require('path');

const async = require('async');
const _ = require('lodash');
const glob = require('glob');
const jsyaml = require('js-yaml');


module.exports = (functionList, opts, done) => {
  
  let envFiles = [];

  async.auto({
    getDefaultConfigs: (cb) => {
      glob("conf/**/default*", (err, files) => {
        if(err) {
          return cb(err);
        }

        async.map(files, (file, acb) => {
          acb(null, jsyaml.safeLoad( fs.readFileSync(file, 'utf-8') ));
        }, cb);
      }); 
    },
    getEnvConfigs: (cb) => {
      glob("conf/**/!(default*)", (err, files) => {
        if(err) {
          return cb(err);
        }
        async.map(files, (file, acb) => {
          let confName = path.basename(file).replace('.yaml', '');
          let confObj = jsyaml.safeLoad( fs.readFileSync(file, 'utf-8') );
          acb(null, [confName, confObj]);
        }, cb);
      });
    },
    buildConfig: ['getDefaultConfigs', 'getEnvConfigs', (cb, results) => {
     
      const fullConf = {};

      const defaultConf = _.defaults.apply(this, results.getDefaultConfigs);
      fullConf._base = defaultConf;
     
      _.each(results.getEnvConfigs, (conf) => {
        fullConf[ conf[0] ] = _.defaults({}, conf[1], fullConf._base);
      });

      cb(null, fullConf);
    }],
    writeConfig: ['buildConfig', (cb, results) => {
      const configs = results.buildConfig;
      async.each(functionList, (funcDir, acb) => {
        fs.writeFile( path.join(funcDir, 'config.json'), JSON.stringify(configs), acb); 
      }, (err) => {
        cb(null, true);
      });
    }],
    prependHandler: ['writeConfig', (cb, results) => {
      async.each(functionList, (funcDir, acb) => {
        
        const fileContents = fs.readFileSync( path.join(funcDir, 'handler.js'), {encoding: 'utf-8'});
        let fileArr = fileContents.split("\n");
        
        let startPoint = 0;
        if(fileArr[0] === "'use strict';") {
          startPoint = 1;
        }

        const newText = [
          '// Injected for config purposes',
          'var configs = require("config.json");',
          ''
        ];

        var args = [startPoint, 0].concat(newText);

        Array.prototype.splice.apply(fileArr, args);

        fs.writeFile(path.join(funcDir, 'handler.js'), _.join(fileArr, "\n"), (err) => {
          acb(err);
        }); 
      }, (err) => {
        cb(null, true);
      });  
    }]
  }, (err) => {
    done(null);
  });
 
};
