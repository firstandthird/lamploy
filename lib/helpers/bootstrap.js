'use strict';
const async = require('async');

const prep = require('../prepare');
const configure = require('../configure');
const list = require('../list');
const upload = require('../upload');
const roles = require('../roles');
const zipup = require('../zipup');

const bundlr = require('../bundler');

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
          prep(dirs, opts, (err, results) => {
            cb(null, results);
          });
        },
        configureFunctions: ['prepareFunctions', (cb, results) => {
          configure(results.prepareFunctions, opts, cb);
        }],
        bundleApp: ['prepareFunctions', 'configureFunctions', (cb, results) => {
          if(!opts.browserify) {
            return cb(null, false);
          }
          bundlr(results.prepareFunctions, opts, cb);
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
          upload.createFunction(results.prepareFunctions, opts, cb);
        }]
      }, (err, results) => {
        done();
      });
    break;
    case 'update':
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
          upload.updateFunction(results.prepareFunctions, opts, cb);
        }]
      }, (err, results) => {
        done();
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
