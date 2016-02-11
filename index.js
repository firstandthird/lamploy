'use strict';

// Main entry point
var async = require('async');
var lamConfig = require('./lib/helpers/config');
var bootstrap = require('./lib/helpers/bootstrap');

module.exports = function(cwd, opts) {
  async.waterfall([
    function(done) {
      lamConfig(cwd, function(err, data) {
        if(err) {
          console.log('lambda.yaml file not found. Please create this file to continue.');
          done(err);
        }
        done(null, data);
      });   
    },
    function(data, done) {
      opts.config = data;
      opts._cwd = cwd;
      bootstrap(opts, function(err, data) {
        done(null);
      }); 
    }
  ], function(err) {
    if(err) {
      console.log('Eeeerrrr', err);
      return;
    }  

  });
};


