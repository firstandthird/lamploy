'use strict';

// Main entry point
var async = require('async');
var lamConfig = require('./lib/helpers/config');
var bootstrap = require('./lib/helpers/bootstrap');

module.exports = function(cwd, opts, cb) {

  if(!opts.log) {
    opts.log = console.log;
  }
  
  async.waterfall([
    (done) => {
      const confData = lamConfig(cwd);   
      done(null, confData);
    },
    function(data, done) {
      opts.config = data;
      opts._cwd = cwd;
      bootstrap(opts, function(err, data) {
        done(null);
      }); 
    }
  ], cb);
};


