#! /usr/bin/env node
'use strict';

const argv = require('yargs').boolean('browserify').alias('b', 'browserify').argv;
const cwd = process.cwd();

const lib = require('../');

lib(cwd, argv);
