'use strict';
const async = require('async');
const _ = require('lodash');
const colors = require('colors/safe');
const Table = require('cli-table');
const buildConf = require('./buildconf');


// lambda build functions
const prep = require('../prepare');
const configure = require('../configure');
const list = require('../list');
const bundlr = require('../bundler');
const upload = require('../upload');
const roles = require('../roles');
const zipup = require('../zipup');
const publish = require('../publish');
const alias = require('../alias');

let functionMap = {};

module.exports = function(opts, done) {

  let action = opts._.shift();
  
  switch(action) {
    case 'list':
      list.list(opts, (err, data) => {
        
        if(err) { return done(err); }

        const table = new Table({
          head: ['Name', 'Handler', 'Version', 'Timeout'],
          colWidths: [35, 25, 12, 12]
        });

        _.each(data.Functions, (func) => {
          if( func.FunctionName.indexOf( opts.config.projectName ) > -1 || opts.listAll === true)  
          
          table.push([
            func.FunctionName,
            func.Handler,
            func.Version,
            func.Timeout
          ]);
        });
        
        console.log(table.toString());

        done(null);
      });
    break;
    case 'publish':
      console.log(colors.yellow('Publishing new function versions.'));
      
      functionMap = buildConf(opts._);
      
      publish(functionMap, opts, (err, results) => {
        _.forIn(results, (val, key) => {
          console.log(colors.yellow('  Published version') + ' ' + colors.red.bold(val.Version) + ' ' + colors.yellow('of function') + ' ' + colors.green(key));
        });
      });
    break;
    case 'deploy':
      console.log(colors.yellow('Deploying...'));
      const aliasMap = opts.versions;
      const description = opts.description || '';

      functionMap = buildConf(opts._); 

      async.waterfall([
        (cb) => {
          const funcVersions = {};
          async.forEachOf(functionMap, (func, funcName, icb) => {
            list.listByFunction(funcName, opts, (err, data) => {
              
              funcVersions[funcName] = data.Versions[(data.Versions.length - 1)];
              console.log(colors.yellow('  Setting function ') + colors.blue(funcName) + colors.yellow(' to version ') + colors.red(funcVersions[funcName].Version));

              icb(err);
            })
          }, (err) => {
            
            cb(null, funcVersions);
          });
        },
        (data, cb) => {
          alias.update(data, aliasMap, description, opts, cb); 
        }
      ], (err, data) => {
          console.log(colors.green('  Done!'));
          done(err, data); 
      });

    break;
    case 'list-aliases':
      console.log(colors.yellow('Listing function aliases.')); 
      
      functionMap = buildConf(opts);
      console.log(functionMap);
      alias.list(functionMap, opts, (err, results) => {
        _.forIn(results, (val, key) => {
          console.log(colors.yellow(' Aliases for ') + colors.green(key));
          
          let tbl = new Table({
            head: ['Alias', 'Version', 'Description'],
            colWidths: [12, 12, 35]
          });
          
          if(val.Aliases.length) {
            _.each(val.Aliases, (alias) => {
              tbl.push([colors.blue(alias.Name), colors.yellow(alias.FunctionVersion), alias.Description]);
            });
            console.log(tbl.toString());
            console.log('');
          } else {
            console.log(colors.red('    No aliases found!'));
            console.log('');
          }
        });
        done(null, true);
      });
    break;
    case 'prepare':
    case 'create':
    case 'update':
      async.auto({
        buildConfs: (cb) => {
          console.log(colors.yellow('Building configurations.'));
          functionMap = buildConf(opts);
          cb(null, functionMap);
        },
        prepareFunctions: ['buildConfs', (cb, results) => {
          console.log(colors.yellow('Preparing functions.'));
          prep(results.buildConfs, opts, (err, data) => {
            if(err) { return cb(err); }
            
            console.log(colors.green('  Done!'));
            cb(null, data);
          });
        }],
        configureFunctions: ['prepareFunctions', (cb, results) => {
          console.log(colors.yellow('Configuring functions.'));
          configure(results.buildConfs, opts, (err, data) => {
            if(err) { return cb(err); }
            
            console.log(colors.green('  Done!'));
            cb(null, data);
          });
        }],
        bundleApp: ['prepareFunctions', 'configureFunctions', (cb, results) => {
          if(!opts.browserify) {
            return cb(null, results.buildConfs);
          }
          console.log(colors.yellow('Bundling functions.'));
          bundlr(results.buildConfs, opts, (err, data) => {
            if(err) { return cb(err); }
            
            console.log(colors.green('  Done!'));
            cb(null, data);
          });
        }],
        zipFiles: ['bundleApp', (cb, results) => {
          console.log(colors.yellow('Zipping function directory.'));
          zipup(results.bundleApp, opts, (err, data) => {
            if(err) { return cb(err); }
            
            console.log(colors.green('  Done!'));
            cb(null, data);
          });
        }],
        createFunctions: ['zipFiles', (cb, results) => {
          if(action !== 'create'){
            return cb(null, false);
          }
          console.log(colors.yellow('Creating lambda function.'));
          upload.createFunction(results.bundleApp, opts, (err, data) => {
            if(err) { return cb(err); }
            
            console.log(colors.green('  Done!'));
            cb(null, data);
          });
        }],
        createAliases: ['createFunctions', (cb, results) => {
          
          if(results.createFunctions === false) {
            return cb(null, false);
          }
          console.log(results);
          console.log(colors.yellow('Creating function aliases'));
          alias.create(results.createFunctions, opts, (err, data) => {
            if(err) { 
              console.log(err);
              return cb(err); 
            }

            console.log(colors.green('  Done!'));
            cb(null, true);
          });
        }],
        updateFunctions: ['zipFiles', (cb, results) => {
          if(action !== 'update'){
            return cb(null, false);
          }
          console.log(colors.yellow('Updating lambda function.'));
          upload.updateFunction(results.bundleApp, opts, (err, data) => {
            if(err) { 
              console.log('ERR! ', err);
              return cb(err); 
            }
            
            console.log(colors.green('  Done!'));
            cb(null, data);
          });
        }],
        updateAliases: ['updateFunctions', (cb, results) => {
          const description = opts.description || '';
          if(!opts.deployDev || results.updateFunctions === false) {
            return cb(null, false);
          }
          console.log(colors.yellow('Deploying dev aliases.'));
          alias.update(results.updateFunctions, ['dev'], description, opts, (err, data) => {
            if(err) { return cb(err); }
            
            console.log(colors.green('  Done!'));
            cb(null, data);
          });
        }]
      }, (err, results) => {
        if(err) {
          console.log(colors.red('An error occured'));
          console.log(err);
          return done(err);
        }
        console.log('');
        console.log(colors.yellow('Process complete.'));
        done(null, null);
      });
    break;
    case 'config':
      configure([], opts, () => {});
    break;
    case 'roles':
      roles(opts, (err) => {});
    break;
    default:
      console.log('invalid usage');
      done();
  }

};
