'use strict';

const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const ncp = require('ncp').ncp;
const async = require('async');
const rimraf = require('rimraf');

const zipup = require('./helpers/zipup');

module.exports = function(dirs, opts, cb) {
  const tempDir = opts._cwd + '/.temp';
  async.waterfall([
    (done) => {
      fs.stat(tempDir, (err, stats) => {
        if (err) {
          // File must not exist, do create it
          return done(null, false);
        }

        done(null, true);
      });
    },
    (fileExists, done) => {
      if(fileExists === true) {
        return done(null);
      }
      fs.mkdir(tempDir, (err) => {
        done(err);
      });
    },
    (done) => {
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
    (dirMap, done) => {
      
      let nodeMon = path.join(opts._cwd, 'node_modules');
      let libDir = path.join(opts._cwd, 'lib');
      let confDir = path.join(opts._cwd, 'conf');

      async.each(dirMap, (dir, acb) => {
        let funcDir = path.join(opts._cwd, dir);
        let lambdaFile = path.join(funcDir, 'lambda.yaml');
        let funcConf = yaml.safeLoad( fs.readFileSync(lambdaFile));
        let funcBase = path.basename(funcDir);
        let funcName = funcConf.name || funcBase;

        async.series([
          (dn) => {
            rimraf(tempDir + '/' + funcName, (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying function files.
            ncp(dir, tempDir + '/' + funcName, (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying global node_module files
            ncp(nodeMon, tempDir + '/' + funcName + '/node_modules', (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying global lib files
            ncp(libDir, tempDir + '/' + funcName + '/lib', (err) => {
              dn(null)
            });
          },
          (dn) => {
            // Copying global lib files
            ncp(confDir, tempDir + '/' + funcName + '/conf', (err) => {
              dn(null)
            });
          },
          (dn) => {
            zipup(tempDir, funcName, (err) => {
              dn(null);
            });
          }
        ], (err) => {
          acb(null);
        });
      }, (err) => {
        done(null, dirMap);
      });
    }
  ], (err) => {
    cb(null);
  });
};