# node-lambda

A CLI / library for working with AWS lambda. Allows you to process and deploy lambda functions to AWS.

## Configuration

Use the following basic setup for your project.
```
  ├─ projectFolder/
  ├─ functions/ (folder that holds all of the functions)
  |  └─ doSomethingFunction/
  |    ├─ lambda.yaml (function configuration folder)
  |    └─ handler.js
  ├─ conf/ (configuration directory with .env files)
  |  └─ default.env (or any other env files required)
  ├─ lib/ (library that is common to all functions)
  ├─ package.json (npm package elements)
  └─ lambda.yaml (project configuration elements)
```

The project configuration file should be a `.yaml` file with the following elements.

```
  region: 'us-east-1'
  projectName: 'exampleProject'
  defaultAliases:
    - 'dev'
    - 'stage'
    - 'prod'
```

The function configuration file should be a `.yaml` file with the following elements.

```
  name: 'functionLambdaName' (optional)
  mainFile: 'handler.js'
  conf:
    Handler: 'handler.handler'
    Timeout: 3
    Role: 'role string' (required)
    Runtime: 'nodejs'
```

## Commands

`node-lambda prepare` - Prepares the function for delpoyment by copying all the required files to a temporary function folder, and performs the zip operation. Useful for debugging or if you need to upload function on your own.

`node-lambda create [function dir glob]` - Prepares the function (same as above) AND creates the initial node function.

`node-lambda update [function dir glob]` - Prepares and updates the node functions.

`node-lambda deploy [function dir glob] --version prod dev` - Deploys the given versions (aliases) to the functions in the glob.

`node-lambda list` - Shows all of the functions currently in AWS, filtered by the project name. To see all of the functions in that region, add `--list-all` option.

`node-lambda list-aliases [function dir glob]` - lists all the aliases for each of the functions in the glob.

## Options

`--browserify` - Runs the lambda code through browserify before compilation, also uses the `es6` and `reactify` transformations.
