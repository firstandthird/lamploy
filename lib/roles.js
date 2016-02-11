'use strict';

const AWS = require('aws-sdk');
const Table = require('cli-table');
const _ = require('lodash');

module.exports = (opts, done) => {
  const iam = new AWS.IAM();
  iam.listRoles({}, (err, data)=> {
    
    if(err) {
      console.log('Bad request', err);
      return done();
    }
    
    const table = new Table({
      head: ['Name', 'ARN', 'Path'],
      colWidths: [30, 60, 5]
    });

    _.each(data.Roles, (role) => {
      table.push([
        role.RoleName,
        role.Arn,
        role.Path
      ]);
    });

    console.log(table.toString());
    done();
  });
};
