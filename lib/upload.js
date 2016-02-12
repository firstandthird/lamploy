'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const AWS = require('aws-sdk');
const async = require('async');


const dirLooper = (dirMap, opts, upFunc, done) => {
  const projName = opts.config.projectName;
  const tempDir = opts._cwd + '/.temp';
  
  async.each(dirMap, (dir, cb) => {
    let funcDir = dir;
    let lambdaFile = path.join(funcDir, 'lambda.yaml');
    let funcConf = {};
    
    funcConf = yaml.safeLoad(fs.readFileSync(lambdaFile));

    let funcBase = path.basename(funcDir);
    let funcName = funcConf.name || funcBase;

    let funcZip = funcName + ".zip";

    let zipFile = path.join(tempDir, funcZip);
    
    upFunc(zipFile, projName, funcName, funcConf, cb);

  }, done);
};

exports.createFunction = (dirMap, opts, done) => {

  const lambda = new AWS.Lambda({region: opts.config.region});
  
  dirLooper(dirMap, opts, (file, projectName, functionName, functionOpts, cb) => {
    
    lambda.createFunction({
      Code: {
        ZipFile: fs.readFileSync(file)
      },
      FunctionName: projectName + "_" + functionName,
      Handler: 'handler.handler',
      Role: "arn:aws:iam::275424596243:role/lambda_basic_execution",
      Runtime: "nodejs"
    }, cb);

  }, (err) => {
    done(null, true);
  });

};

exports.updateFunction = (dirMap, opts, done) => {
  const lambda = new AWS.Lambda({region: opts.config.region});
  
  dirLooper(dirMap, opts, (file, projectName, functionName, functionOpts, cb) => {
    lambda.updateFunctionCode({
      ZipFile: fs.readFileSync(file),
      FunctionName: projectName + "_" + functionName,
      Publish: true
    }, cb);

  }, (err) => {
    done(null, true);
  });
};


/* module.exports = (dirMap, opts, done) => {
  
  

    
  }, (err) => {
    done();
  });
}; */
