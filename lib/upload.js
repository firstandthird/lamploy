'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const AWS = require('aws-sdk');
const async = require('async');
const _ = require('lodash');

const dirLooper = (dirMap, opts, upFunc, done) => {
  const projName = opts.config.projectName;
  const tempDir = opts._cwd + '/.temp';

  const returnData = {};

  async.forEachOf(dirMap, (dir, funcName, cb) => {
    let funcDir = dir._tempBundleDir || dir._tempDir;
    let lambdaFile = path.join(funcDir, 'lambda.yaml');
    
    let zipFile = funcDir + '.zip';
    
    upFunc(zipFile, projName, funcName, dir, (err, data) => {
      returnData[funcName] = data;
      cb(err);
    });

  }, (err) => {
    done(err, returnData);
  });
};

exports.createFunction = (dirMap, opts, done) => {

  const lambda = new AWS.Lambda({region: opts.config.region});
  
  dirLooper(dirMap, opts, (file, projectName, functionName, functionOpts, cb) => {
    
    const args = {
        Code: {
          ZipFile: fs.readFileSync(file)
        },
        Publish: true,
        FunctionName: projectName + "_" + functionName
      };

    _.assign(args, {Handler: 'handler.handler', Runtime: 'nodejs'}, functionOpts.conf);
    
    lambda.createFunction(args, (err, data) => {
      cb(err, data);
    });

  }, (err, data) => {
    done(err, data);
  });

};

exports.updateFunction = (dirMap, opts, done) => {
  const lambda = new AWS.Lambda({region: opts.config.region});
  
  dirLooper(dirMap, opts, (file, projectName, functionName, functionOpts, cb) => {
    
    let params =  {
      ZipFile: fs.readFileSync(file),
      FunctionName: projectName + "_" + functionName,
      Publish: true
    };
    

    if(opts.skipPublish) {
      params.Publish = false
    }

    lambda.updateFunctionCode(params, cb);
  
  }, (err, data) => {
    done(err, data);
  });
};

