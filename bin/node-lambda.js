#! /usr/bin/env node
'use strict';

const argv = require('yargs').argv;
const cwd = process.cwd();

const lib = require('../');

lib(cwd, argv);
