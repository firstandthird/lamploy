'use strict';

const glob = require('glob');
const jsyaml = require('jsyaml');

module.exports = (opts, done) => {
  glob("conf/!(default*)", (err, files) => {
    done();
  });
};
