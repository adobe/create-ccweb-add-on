# @adobe/ccweb-add-on-scripts

[![Version](https://img.shields.io/npm/v/@adobe/ccweb-add-on-scripts.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-scripts)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/ccweb-add-on-scripts.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-scripts)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/license/mit)

## Description

This package provides commands which can be used to build, start and package your Adobe Express add-on. These commands are used as scripts in the add-on project, created using [@adobe/create-ccweb-add-on](https://www.npmjs.com/package/@adobe/create-ccweb-add-on).

## Commands

| Command | Description                        | Basic Usage                                     |
| ------- | ---------------------------------- | ----------------------------------------------- |
| clean   | Clean the build output directory.  | ccweb-add-on-scripts clean                      |
| build   | Build the add-on.                  | ccweb-add-on-scripts build --use <transpiler>   |
| start   | Host the add-on on a local server. | ccweb-add-on-scripts start --port <port-number> |
| package | Package the add-on for submission. | ccweb-add-on-scripts package                    |

For detailed usage guides, you may check `npx @adobe/ccweb-add-on-scripts --help`.

For more information about developing Adobe Express add-ons, check out the [documentation](https://developer.adobe.com/express/add-ons/).
