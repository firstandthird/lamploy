'use strict';

const AWS = require('aws-sdk');
const async = require('async');

exports.list = (funcMap, opts, done) => {
 
  const lambda = new AWS.Lambda();
  const returnObject = {};

  async.forEachOf(funcMap, (dir, funcName, cb) => {
    let awsParam = {
      FunctionName: opts.namespace + '_' + funcName
    };

    lambda.listAliases(awsParam, (err, data) => {
     if(err) { return cb(err); }
     returnObject[funcName] = data;
     cb(null);
    });
  }, (err) => {
    done(null, returnObject);
  });

};

exports.create = (funcMap, opts, done) => {
  const lambda = new AWS.Lambda();
  async.forEachOf(funcMap, (dir, funcName, cb) => {
      let awsParam = {
        FunctionName: opts.namespace + '_' + funcName,
        FunctionVersion: dir._result.Version,
        Name: opts.tag
      };

      lambda.createAlias(awsParam, cb);
  }, (err) => {
    done(err);
  });
};

exports.update = (funcMap, opts, done) => {
  const lambda = new AWS.Lambda();
  const returnObj = {};
  
  async.forEachOf(funcMap, (dir, funcName, cb) => {
      let awsParam = {
        FunctionName: opts.namespace + '_' + funcName,
        FunctionVersion: dir._result.Version,
        Name: opts.tag,
      };

      if(opts.description) {
        awsParam.Description = opts.description;
      }

      lambda.updateAlias(awsParam, (err, data) => {
        if(err && err.code === 'ResourceNotFoundException') {
          returnObj[funcName] = 'doCreate';
        }

        cb(null, data);
      });
  }, (err) => {
    done(null, returnObj);
  });
};
