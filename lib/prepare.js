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
        return done(null, true);
      }
      fs.mkdir(tempDir, (err) => {
        done(err, true);
      });
    }],

    copyFiles: ['createFile', (done, results) => {
    
      const nodeMon = path.join(opts._cwd, 'node_modules');
      const libDir = path.join(opts._cwd, 'lib');
      const confDir = path.join(opts._cwd, 'conf');
      const pckgFile = path.join(opts._cwd, 'package.json'); 

      async.forEachOf(dirs, (dirObj, func, acb) => {

        let funcDir = path.join(opts._cwd, dirObj._baseDir);
        let tempFuncDir = path.join(opts._cwd, dirObj._tempDir);

        async.series([
          (dn) => {
            rimraf(tempFuncDir, (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying function files.
            ncp(funcDir, tempFuncDir, (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying global node_module files
            ncp(nodeMon, tempFuncDir + '/node_modules', (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying global lib files
            ncp(libDir, tempFuncDir + '/lib', (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying global lib files
            ncp(confDir, tempFuncDir + '/conf', (err) => {
              dn(null);
            });
          }
        ], (err) => {
          acb(null);
        });
      }, (err) => {
        done(null, true);
      });
    }
  ]}, (err, results) => {
    cb(null, results);
  });
};
