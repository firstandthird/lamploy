# node-lambda

A CLI / library for working with AWS lambda. Allows you to process and deploy lambda functions to AWS.

## Commands

`node-lambda prepare` - Prepares the function for delpoyment by copying all the required files to a temporary function folder, and performs the zip operation. Useful for debugging or if you need to upload function on your own.

`node-lambda create [function dir glob]` - Prepares the function (same as above) AND creates the initial node function.

`node-lambda update [function dir glob]` - Prepares and updates the node functions.

`node-lambda list` - Shows all of the functions currently in AWS, filtered by the project name. To see all of the functions in that region, add `--list-all` option.

## Options

`--browserify` - Runs the lambda code through browserify before compilation, also uses the `es6` and `reactify` transformations.
