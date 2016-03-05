# node-lambda

A CLI / library for working with AWS lambda. Allows you to process and deploy lambda functions to AWS.

## Commands

##### `deploy`

```
  $ node-lambda deploy [function dir glob]
```

Deploys the given versions (aliases) to the functions in the glob by creating or updating them.

__Options__

  `-e` `--env-vars VAR=value` Sets and env var during configuration phase

  `--env-file [file]` Sets and env file in `.env` format that is parsed and set during the configuration phase
  
  `--namesapce [project-name]` Sets a namespace for the lambda functions. Defaults to current folder name
  
  `--tag [Alias]` Set a lambda alias for the current deployment.
  
  `--role [AWS Role]` Sets the role for the current set of functions being deployed

 `--description [Description]` Sets up a description for the alias phase of the deployment.

 `--handler-file [file]` Configures function to use a different handler file. Defaults to `index.js` and `index.handler`

*****

##### `list`

```
  $ node-lambda list
``` 
Shows all of the functions currently in AWS, filtered by the project name.

__Options__

 `--list-all` Shows all of the functions in the current region

*****

##### `list-aliases`

```
  $ node-lambda list-aliases [function dir glob]
```

Lists all the aliases for each of the functions in the glob.
