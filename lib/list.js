'use strict';

const AWS = require('aws-sdk');
const Table = require('cli-table');
const _ = require('lodash');

exports.list = (opts, cb) => {
  const lambda = new AWS.Lambda();
  lambda.listFunctions({}, cb); 
};

exports.listByFunction = (funcName, opts, cb) => {
  const lambda = new AWS.Lambda();
  lambda.listVersionsByFunction({FunctionName: opts.namespace + '_' + funcName}, cb);
};
