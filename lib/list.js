'use strict';

const AWS = require('aws-sdk');
const Table = require('cli-table');
const _ = require('lodash');

exports.list = (opts, cb) => {
  const lambda = new AWS.Lambda({region: opts.config.region});
  lambda.listFunctions({}, cb); 
};

exports.listByFunction = (funcName, opts, cb) => {
  const lambda = new AWS.Lambda({region: opts.config.region});
  lambda.listVersionsByFunction({FunctionName: opts.config.projectName + '_' + funcName}, cb);
};
