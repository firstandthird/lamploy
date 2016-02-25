'use strict';
const _ = require('lodash');
const dirConf = require('./config');

module.exports = (opts) => {

  const dirs = opts._;
  const functionMap = {};

  _.each(dirs, (dir) => {
    let conf = dirConf(dir);
    
    if(conf === false) {
      return;
    }

    conf._baseDir = dir;
    let funcName = conf.name || path.basename(dir);
    conf._tempDir = '.temp/' + funcName;

    functionMap[funcName] = conf;
  });

  return functionMap;
};
