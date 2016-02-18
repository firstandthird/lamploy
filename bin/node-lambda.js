#! /usr/bin/env node
'use strict';

const argv = require('yargs')
  .boolean('browserify')
  .alias('b', 'browserify')
  .array('versions')
  .argv;

const cwd = process.cwd();

const lib = require('../');

lib(cwd, argv, (err, result) => {
  if(err) {
    return console.log(err);
  }
});
