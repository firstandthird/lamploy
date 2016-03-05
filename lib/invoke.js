'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const _ = require('lodash');
const fs = require('fs');


module.exports = function(dirMap, opts, done) {

  const lambda = new AWS.Lambda();
  const returnPayload = {};

  async.forEachOf(dirMap, (dir, funcName, cb) => {
    let lambdaName = opts.namespace + "_" + funcName;
    let params = {};
    let payload = {};

    if(opts.tag) {
      lambdaName += ":" + opts.tag;
    }

    params.FunctionName = lambdaName;

    if(opts.payload) {
      payload = JSON.parse(opts.payload);
    }
  
    if(opts.testFile) {
      payload = fs.readFileSync(opts.testFile);
    }

    if(!_.isEmpty(payload)) {
      params.Payload = payload;
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
