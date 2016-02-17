'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const babelify = require('babelify');

const bes2015 = require('babel-preset-es2015');

const async = require('async');


module.exports = (dirMap, opts, done) => {
  async.each(dirMap, (dir, cb) => {
    
    let b = browserify();
    
    let lambdaFile = dir + '/lambda.yaml';
    let funcConf = yaml.safeLoad( fs.readFileSync(lambdaFile));
    
    let minDir = path.join(dir, '..', funcConf.name + '.min');

    try {
      fs.statSync(minDir);
    } catch (e) {
      fs.mkdirSync(minDir); 
    }
    let handler = funcConf.handler || 'handler.js';
    
    let fileStream = fs.createWriteStream(minDir + '/' + handler);
    fileStream.on('finish', () => {
     cb(null);
    });

    b
      .add(dir + '/' + handler)
      .transform(babelify, {presets: [bes2015]})
      .bundle()
      .pipe(fileStream);

  }, (err) => {
    if(err) {
      return done(err);
    }
    done(null, true);
  });
};
