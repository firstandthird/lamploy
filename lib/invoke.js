'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const _ = require('lodash');

module.exports = function(dirMap, opts, done) {

  const lambda = new AWS.Lambda();
  const projName = opts.config.projectName;

  const returnPayload = {};

  async.forEachOf(dirMap, (dir, funcName, cb) => {
    let lambdaName = opts.config.projectName + "_" + funcName;
    let params = {};
    let payload = {};

    if(opts.alias) {
      lambdaName += ":" + opts.alias;
    }

    params.FunctionName = lambdaName;

    if(dir.test) {
      payload = dir.test; 
    }
    
    if(opts.payload) {
      payload = _.defaults({}, JSON.parse(opts.payload), payload);
    }
   
    if(!_.isEmpty(payload)) {
      params.Payload = JSON.stringify(payload);
    }

    lambda.invoke(params, (err, data) => {
      if(err) {
        cb(err);
        return;
      }
      
      let payload = JSON.parse(data.Payload);
      returnPayload[funcName] = payload;
      
      cb(null);
    });

  }, (err) => {
    done(err, returnPayload);
  });

  
};
