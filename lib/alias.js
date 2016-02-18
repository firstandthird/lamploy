'use strict';

const AWS = require('aws-sdk');
const async = require('async');

exports.list = (funcMap, opts, done) => {
 
  const lambda = new AWS.Lambda({region: opts.config.region});
  const returnObject = {};

  async.forEachOf(funcMap, (dir, funcName, cb) => {
    let awsParam = {
      FunctionName: opts.config.projectName + '_' + funcName
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
  const lambda = new AWS.Lambda({region: opts.config.region});
  const aliases = opts.config.defaultAliases || ['dev', 'stage', 'prod'];
  const returnObj = {};
  async.forEachOf(funcMap, (dir, funcName, cb) => {
    async.eachSeries(aliases, (alias, cb) => {
      let awsParam = {
        FunctionName: opts.config.projectName + '_' + funcName,
        FunctionVersion: dir.Version,
        Name: alias,
        Description: 'Alias Created during function creation.'
      };

      lambda.createAlias(awsParam, cb);
    }, done);
  });
};

exports.update = (funcMap, aliasMap, description, opts, done) => {
  const lambda = new AWS.Lambda({region: opts.config.region});
  const aliases = opts.config.defaultAliases || ['dev', 'stage', 'prod'];
  const returnObj = {};
  async.forEachOf(funcMap, (dir, funcName, cb) => {
    async.eachSeries(aliasMap, (alias, cb) => {
      let awsParam = {
        FunctionName: opts.config.projectName + '_' + funcName,
        FunctionVersion: dir.Version,
        Name: alias,
        Description: description
      };

      lambda.updateAlias(awsParam, cb);
    }, done);
  });
};
