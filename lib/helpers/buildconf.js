'use strict';
const _ = require('lodash');
const dirConf = require('./config');
const fs = require('fs');
const path = require('path');



module.exports = (opts) => {

  const defaultConfigs = {
    mainFile: opts.handlerFile || 'index.js',
    conf: {
      Handler: 'index.handler',
      Runtime: 'nodejs',
      Role: opts.role
    }
  };

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

    // Setting up defaults from previous lambda.yaml configuration
    if(!conf.name) {
      conf.name = funcName;
    }

    conf = _.defaultsDeep(conf, defaultConfigs);

    functionMap[funcName] = conf;
  });

  return functionMap;
};
