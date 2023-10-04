# @adobe/ccweb-add-on-ssl

[![Version](https://img.shields.io/npm/v/@adobe/ccweb-add-on-ssl.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-ssl)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/ccweb-add-on-ssl.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-ssl)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/license/mit)

## Description

This package provides commands which can be used to set up your self-signed SSL certificate. This SSL certificate is used to locally host the add-on on your browser trusted HTTPS.

These commands are used by [@adobe/create-ccweb-add-on](https://www.npmjs.com/package/@adobe/create-ccweb-add-on) to set up your one-time SSL certificate during its first run on your system.

## Commands

| Command | Description                                          | Basic Usage                                 |
| ------- | ---------------------------------------------------- | ------------------------------------------- |
| setup   | Automatically set up self-signed SSL in your system. | ccweb-add-on-ssl setup --hostname localhost |

For detailed usage guides, you may check `npx @adobe/ccweb-add-on-ssl --help`.

For more information about developing Adobe Express add-ons, check out the [documentation](https://developer.adobe.com/express/add-ons/).
