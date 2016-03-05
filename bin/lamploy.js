#! /usr/bin/env node
'use strict';

const path = require('path');

const argv = require('yargs')
  .boolean('skip-browserify')
  .boolean('skip-publish')
  .alias('sb', 'skip-browserify')
  .alias('sp', 'skip-publish')
  .array('versions')
  .alias('e', 'env-vars')
  .argv;

argv._cwd = process.cwd();

const lib = require('../lib/helpers/bootstrap');

lib(argv, (err, result) => {
  if(err) {
    return console.log(err);
  }
});
