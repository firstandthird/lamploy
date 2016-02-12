'use strict';
const async = require('async');

const prep = require('../prepare');
const configure = require('../configure');
const list = require('../list');
const create = require('../create');
const roles = require('../roles');
const zipup = require('../zipup');

module.exports = function(opts, done) {
  if(opts._.length === 0) {
    console.log('Usage ./node-lambda [action]');
    done(null, 'err');
  }

  let action = opts._.shift();
  let dirs = opts._;
  switch(action) {
    case 'prepare':
      async.auto({
        prepareFunctions: (cb) => {
          prep(dirs, opts, cb);
        },
        configureFunctions: ['prepareFunctions', (cb, results) => {
          configure(results.prepareFunctions, opts, cb);
        }],
        zipFiles: ['configureFunctions', (cb, results) => {
          zipup(results.prepareFunctions, cb);
        }]
      }, (err, results) => {
        done();
      });
    break;
    case 'list':
      list(opts, (err, result) => {
        done('done');
      });
    break;
    case 'create':
      async.auto({
        prepareFunctions: (cb) => {
          prep(dirs, opts, cb);
        },
        configureFunctions: ['prepareFunctions', (cb, results) => {
          configure(results.prepareFunctions, opts, cb);
        }],
        zipFiles: ['configureFunctions', (cb, results) => {
          zipup(results.prepareFunctions, cb);
        }],
        createFunction: ['zipFiles', (cb, results) => {
          create(results.prepareFunctions, opts, cb);
        }]
      }, (err, results) => {
        done();
      });
    break;
    case 'update':
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
    case 'config':
      configure([], opts, () => {});
    break;
    case 'roles':
      roles(opts, (err) => {});
    break;
    default:
      console.log('invalid usage');
      done();
  }

};
