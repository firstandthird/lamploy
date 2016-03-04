'use strict';

const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

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
    
      async.forEachOf(dirs, (dirObj, func, acb) => {

        let funcDir = path.join(opts._cwd, dirObj._baseDir);
        let tempFuncDir = path.join(opts._cwd, dirObj._tempDir);
        
        async.series([
          (dn) => {
            fs.remove(tempFuncDir, (err) => {
              dn(null);
            });
          },
          (dn) => {
            // Copying function files.
            fs.copy(funcDir, tempFuncDir, (err) => {
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
