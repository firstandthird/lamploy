#! /usr/bin/env node
'use strict';

const path = require('path');

const argv = require('yargs')
  .boolean('browserify')
  .boolean('skip-publish')
  .alias('b', 'browserify')
  .array('versions')
  .argv;

const cwd = process.cwd();

const lib = require('../');

lib(cwd, '', argv, (err, result) => {
  if(err) {
    return console.log(err);
  }
});
