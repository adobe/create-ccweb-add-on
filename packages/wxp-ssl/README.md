# @adobe/ccweb-add-on-ssl

[![Version](https://img.shields.io/npm/v/@adobe/ccweb-add-on-ssl.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-ssl)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/ccweb-add-on-ssl.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-ssl)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/license/mit)

## Description

This package provides commands which can be used to set up your self-signed SSL certificate. This SSL certificate is used to locally host the add-on on your browser trusted HTTPS.

These commands are used by [@adobe/create-ccweb-add-on](https://www.npmjs.com/package/@adobe/create-ccweb-add-on) to set up a locally trusted SSL certificate in your system as a one-time step.

## Commands

| Command | Description                                                  | Basic Usage                                 |
| ------- | ------------------------------------------------------------ | ------------------------------------------- |
| setup   | Setup a locally trusted SSL certificate for hosting add-ons. | ccweb-add-on-ssl setup --hostname localhost |
| purge   | Remove all add-on related SSL artifacts from your system.    | ccweb-add-on-ssl purge                      |

For detailed usage guides, you may check `npx @adobe/ccweb-add-on-ssl --help`.

For more information about developing Adobe Express add-ons, check out the [documentation](https://developer.adobe.com/express/add-ons/).
