'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const JSZip = require('jszip');
const Glob = require("glob").Glob;

module.exports = (dirs, done) => {
  
  async.each(dirs, (dir, done) => {
    
    const zip = new JSZip();
    const thisDir = dir;
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
        fs.writeFile(thisDir + ".zip", buffer, function(err) {
          console.log(err);
          done(null);
        });
      });
    });

  }, done);
};
