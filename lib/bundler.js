'use strict';

const yaml = require('js-yaml');
const fs = require('fs');

const browserify = require('browserify');
const async = require('async');


module.exports = (dirMap, opts, done) => {
  async.each(dirMap, (dir, cb) => {
    
    let b = browserify();
    
    let lambdaFile = dir + '/lambda.yaml';
    let funcConf = yaml.safeLoad( fs.readFileSync(lambdaFile));
    
    let handler = funcConf.handler || 'handler.js';
    
    let fileStream = fs.createWriteStream(dir + "/handler.browserify.js");
    fileStream.on('finish', () => {
     cb(null);
    });

    b
      .add(dir + '/' + handler)
      .transform('babelify', {presets: ["es2015", "react"]})
      .bundle()
      .pipe(fileStream);

  }, (err) => {
    if(err) {
      return done(err);
    }
    done(null, true);
  });
};
