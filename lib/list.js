'use strict';

const AWS = require('aws-sdk');
const Table = require('cli-table');
const _ = require('lodash');

module.exports = (opts, cb) => {

  const lambda = new AWS.Lambda({region: opts.config.region});
  lambda.listFunctions({}, (err, data) => {
    
    if(err) {
      return console.log(err);
    }

    const table = new Table({
      head: ['Name', 'Handler', 'Version'],
      colWidths: [25, 25, 25]
    });

    _.each(data.Functions, (func) => {
      
      if( func.FunctionName.indexOf( opts.config.projectName ) > -1 || opts.listAll === true)  
      table.push([
        func.FunctionName,
        func.Handler,
        func.Version
      ]);
    });

    console.log(table.toString());
    cb(null);
  }); 
};
