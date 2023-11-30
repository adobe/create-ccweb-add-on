# @adobe/ccweb-add-on-sdk-types

[![Version](https://img.shields.io/npm/v/@adobe/ccweb-add-on-sdk-types.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-sdk-types)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/ccweb-add-on-sdk-types.svg)](https://npmjs.org/package/@adobe/ccweb-add-on-sdk-types)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/license/mit)

## Description

This package exports type definitions for [@adobe/create-ccweb-add-on](https://www.npmjs.com/package/@adobe/create-ccweb-add-on). It provides auto-completion and type checking capabilities which improves the TypeScript add-on development experience.

## Usage Notes

For TypeScript add-on projects created using [@adobe/create-ccweb-add-on](https://www.npmjs.com/package/@adobe/create-ccweb-add-on), this package is pre-installed. Additionally, the below files are included in the add-on project (based on the selected runtime):

-   [add-on-ui-sdk.d.ts](https://github.com/adobe/create-ccweb-add-on/blob/main/packages/wxp-sdk-types/add-on-ui-sdk.d.ts)
-   [add-on-sandbox-sdk.d.ts](https://github.com/adobe/create-ccweb-add-on/blob/main/packages/wxp-sdk-types/add-on-sandbox-sdk.d.ts)

However, if you are installing this package on your existing add-on project, ensure to include the above type definition files in your `src` directory.

For more information about developing Adobe Express add-ons, check out the [documentation](https://developer.adobe.com/express/add-ons/).
