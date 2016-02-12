'use strict';

const path = require('path');
const fs = require('fs');

const AWS = require('aws-sdk');
const async = require('async');

module.exports = (dirMap, opts, done) => {
  const projName = opts.config.projectName;
  const lambda = new AWS.Lambda({region: opts.config.region});
  const tempDir = opts._cwd + '/.temp';

  async.each(dirMap, (dir, cb) => {
    let funcDir = path.join(opts._cwd, dir);
    let lambdaFile = path.join(funcDir, 'lambda.yaml');
    let funcConf = {};
    try {
      funcConf = fs.readFileSync(lambdaFile);
    } catch(e) {
      funcConf = {};
    }
    let funcBase = path.basename(funcDir);
    let funcName = funcConf.name || funcBase;

    let funcZip = funcName + ".zip";

    let zipFile = path.join(tempDir, funcZip);
    console.log(zipFile);

    lambda.createFunction({
      Code: {
        ZipFile: fs.readFileSync(zipFile)
      },
      FunctionName: projName + "_" + funcName,
      Handler: 'handler.handler',
      Role: "arn:aws:iam::275424596243:role/lambda_basic_execution",
      Runtime: "nodejs"
    }, (err, data) => {
      if(err) {
        console.log(err, err.stack);
      }
      console.log(data);
    });

  }, (err) => {
    done();
  });
};
