'use strict';

// Main entry point
var async = require('async');
var lamConfig = require('./lib/helpers/config');
var bootstrap = require('./lib/helpers/bootstrap');

module.exports = function(cwd, modPath, opts, cb) {

  if(!opts.log) {
    opts.log = console.log;
  }
  
  async.waterfall([
    (done) => {
      const confData = lamConfig(cwd);   
      const pkgData = require(cwd +  '/package.json');

      done(null, confData, pkgData);
    },
    function(data, pkg, done) {
      opts.config = data;
      opts._cwd = cwd;
      opts._pkg = pkg;
      bootstrap(opts, function(err, data) {
        done(null);
      }); 
    }
  ], cb);
};


