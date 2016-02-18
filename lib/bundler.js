'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const babelify = require('babelify');

const bes2015 = require('babel-preset-es2015');

const async = require('async');


module.exports = (dirMap, opts, done) => {
  
  async.forEachOf(dirMap, (dir, funcName, cb) => {
    
    let minDir = dir._tempDir + '.min';
    let mainFile = dir.mainFile || 'handler.js';

    dir._tempBundleDir = minDir;

    try {
      fs.statSync(minDir);
    } catch (e) {
      fs.mkdirSync(minDir); 
    }
    let handler = dir.mainFile || 'handler.js';
    
    let fileStream = fs.createWriteStream(minDir + '/' + mainFile);
    fileStream.on('finish', () => {
     cb(null);
    });

    
    let b = browserify({
        entries: [dir._tempDir + '/' + handler],
        browserField: false, 
        builtins: false, 
        commondir: false, 
        ignoreMissing: true, 
        detectGlobals: true, 
        standalone: 'handleMe',
        insertGlobalVars: {
          process: function() {}
        }
      });

    b
      .transform(babelify, {presets: [bes2015]})
      .bundle()
      .pipe(fileStream);

  }, (err) => {
    if(err) {
      return done(err);
    }
    done(null, dirMap);
  });
};
