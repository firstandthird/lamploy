'use strict';
const async = require('async');

const prep = require('../prepare');
const list = require('../list');
const create = require('../create');
const roles = require('../roles');

module.exports = function(opts, done) {
  if(opts._.length === 0) {
    console.log('Usage ./node-lambda [action]');
    done(null, 'err');
  }

  var action = opts._.shift();
  
  switch(action) {
    case 'prepare':
      const dir = opts._;
      prep(dir, opts, () => {
        done('done');
      });
    break;
    case 'list':
      list(opts, (err, result) => {
        done('done');
      });
    break;
    case 'create':
      const dirs = opts._;
      console.log(opts);
      async.waterfall([
        (dn) => {
          if(opts.skipPrep) {
            return dn(null);
          }
          prep(dirs, opts, (err) => {
            dn(null);
          });
        },
        (dn) => {
          create(dirs, opts, (err) => {
            dn(null);
          });
        }
      ], (err) => {
        done('done');
      });
    break;
    case 'update':
      console.log('Update some other shiz');
    break;
    case 'roles':
      roles(opts, (err) => {});
    break;
    default:
      console.log('invalid usage');
      done();
  }

};
