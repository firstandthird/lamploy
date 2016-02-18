'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const JSZip = require('jszip');
const Glob = require("glob").Glob;

module.exports = (dirs, opts, done) => {

  async.forEachOf(dirs, (dir, funcName, done) => {
    
    const zip = new JSZip();
    const tempDir = dir._tempBundleDir || dir._tempDir;
    const thisDir = path.join( opts._cwd, tempDir);
    const mg = new Glob( thisDir + "/**");

    mg.on('end', () => {
      async.forEachOfSeries(mg.cache, (item, key, cb) => {
        if(item === 'FILE') {
          let fileName = key.replace(thisDir + '/', '');
          return fs.readFile(key, (err, data) => {
            zip.file(fileName, data);
            cb(null);
          });
        }

        cb(null);
      }, (err) => {
        const buffer = zip.generate({type: "nodebuffer"});
        fs.writeFile(thisDir + ".zip", buffer, done);
      });
    });

  }, done);
};
