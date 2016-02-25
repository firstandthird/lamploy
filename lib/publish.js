'use strict';

const AWS = require('aws-sdk');
const async = require('async');

module.exports = (dirMap, opts, done) => {
  
  const lambda = new AWS.Lambda({region: opts.config.region});

  const returnObject = {};

  async.forEachOf(dirMap, (dir, funcName, cb) => {
    let awsParam = {
      FunctionName: opts.config.projectName + '_' + funcName
    };

    if(opts.description) {
      awsParam.Description = opts.description;
    }

    lambda.publishVersion(awsParam, (err, data) => {
      if(err) { return cb(err); }

      returnObject[funcName] = data;
      cb(null);
    });

  }, (err) => {
    if(err) {
      return done(err);
    }

    done(null, returnObject);
  });
};
