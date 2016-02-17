'use strict';

const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const ncp = require('ncp').ncp;
const async = require('async');
const rimraf = require('rimraf');


module.exports = function(dirs, opts, cb) {
  const tempDir = opts._cwd + '/.temp';
  async.auto({
    checkFile: (done) => {
      fs.stat(tempDir, (err, stats) => {
        if (err) {
          // File must not exist, do create it
          return done(null, false);
        }

        done(null, true);
      });
    },

    createFile: ['checkFile', (done, results) => {
      if(results.checkFile === true) {
        return done(null);
      }
      fs.mkdir(tempDir, (err) => {
        done(err, true);
      });
    }],

    findFunctions: (done) => {
      async.filter(dirs, (dir, acb) => {
        let lambdaFile = path.join(opts._cwd, dir, 'lambda.yaml');
        fs.stat(lambdaFile, (err, stat) => {
          if(err) {
            return acb(false);
          }
          acb(true);
        }); 
      }, (dirMap) => {
        done(null, dirMap);
      }); 
    },

    copyFiles: ['createFile', 'findFunctions', (done, results) => {
    
      const tempFuncs = [];

      const nodeMon = path.join(opts._cwd, 'node_modules');
      const libDir = path.join(opts._cwd, 'lib');
      const confDir = path.join(opts._cwd, 'conf');
      const pckgFile = path.join(opts._cwd, 'package.json'); 

      async.each(results.findFunctions, (dir, acb) => {
        let funcDir = path.join(opts._cwd, dir);
        let lambdaFile = path.join(funcDir, 'lambda.yaml');
        let funcConf = yaml.safeLoad( fs.readFileSync(lambdaFile));
        let funcBase = path.basename(funcDir);
        let funcName = funcConf.name || funcBase;

        let tempFuncDir = tempDir + '/' + funcName;
        tempFuncs.push(tempFuncDir);

        async.series([
          (dn) => {
            rimraf(tempFuncDir, (err) => {
              if(err) { console.log( err )}
              dn(null);
            });
          },
          (dn) => {
            // Copying function files.
            ncp(dir, tempDir + '/' + funcName, (err) => {
              if(err) { console.log( 'function', err )}
              dn(null);
            });
          },
          (dn) => {
            // Copying global node_module files
            ncp(nodeMon, tempDir + '/' + funcName + '/node_modules', (err) => {
              if(err) { console.log( 'node_mods', err )}
              dn(null);
            });
          },
          (dn) => {
            // Copying global lib files
            ncp(libDir, tempDir + '/' + funcName + '/lib', (err) => {
              if(err) { console.log( 'global lib', err )}
              dn(null);
            });
          },
          (dn) => {
            // Copying global lib files
            ncp(confDir, tempDir + '/' + funcName + '/conf', (err) => {
              if(err) { console.log( 'global lib', err )}
              dn(null);
            });
          }/*,
          (dn) => {
            // Copying package.json
            ncp(pckgFile, tempDir + '/' + funcName + '/package.json', (err) => {
              if(err) { console.log( 'package.json', err )}
              dn(null);
            });
          }*/
        ], (err) => {
          acb(null);
        });
      }, (err) => {
        done(null, tempFuncs);
      });
    }
  ]}, (err, results) => {
    cb(null, results.copyFiles);
  });
};
