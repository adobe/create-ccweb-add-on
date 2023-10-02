# create-ccweb-add-on

Create a new add-on project for Adobe Express.

[![Version](https://img.shields.io/npm/v/@adobe/create-ccweb-add-on.svg)](https://npmjs.org/package/@adobe/create-ccweb-add-on)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/create-ccweb-add-on.svg)](https://npmjs.org/package/@adobe/create-ccweb-add-on)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/license/mit)

<!-- toc -->

-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Create your first add-on project](#create-your-first-add-on-project)
    -   [Configure Developer Mode for Adobe Express](#configure-developer-mode-for-adobe-express)
    -   [Load your add-on in Adobe Express](#load-your-add-on-in-adobe-express)
    -   [Make changes to your add-on](#make-changes-to-your-add-on)
-   [Usage](#usage)
<!-- tocstop -->

## Getting Started

Be sure to check out the [documentation for developing Adobe Express add-ons](https://developer.adobe.com/express/add-ons/). If you want to get started, quickly, be sure to take a look at the [Quick Start Guide](https://developer.adobe.com/express/add-ons/docs/guides/getting_started/quickstart/).

To quickly get started building an Adobe Express add-on, follow these steps, or watch [this video](https://www.youtube.com/watch?v=kSq4ykQGOdo).

### Prerequisites

You'll need:

-   Node 16 or better
-   NPM 8 or better
-   A text editor
-   A free Adobe account — don't have one? Get one [here](https://www.adobe.com/express/)

### Create your first add-on project

```sh
npx @adobe/create-ccweb-add-on hello-world --template javascript
cd hello-world
npm run build
npm run start
```

> **Note**: You'll be prompted to login to your Adobe account and you may also be prompted to accept the Adobe Developer Terms of Use if you haven't done so previously. You may also be prompted to configure SSL — you'll want to do to this step to ensure that your add-on can be loaded inside of Adobe Express while you develop it.

### Configure Developer Mode for Adobe Express

You'll only need to do these steps once:

-   Log in to [Adobe Express](https://new.express.adobe.com) and click on your avatar icon (this is in the upper right-hand corner of the page).
-   Then click "Settings".
-   In the "General" tab of the Settings dialog, find the "Add-on Development" setting and toggle this to "on".

### Load your add-on in Adobe Express

Now that you've enabled developer mode, you can load an add-on you're building into Adobe Express by following these steps:

-   Create a new document (or open an existing one)
-   Click the "Add-ons" icon in the left-hand rail
-   Click the "Your add-ons" tab
-   At the bottom of this tab you'll see an "Add-on testing" toggle — switch this to "on"
-   You'll get a prompt to specify the local connection address — the default is typically sufficent. Accept the default address.
-   A new "In development" section should appear in your add-ons list w/ a "hello-world" add-on.
-   Click this icon and your add-on will be running in a panel on the right-hand side of the page.

### Make changes to your add-on

Now you can make changes to your add-on's code and your add-on will be reloaded automatically inside of Adobe Express to reflect your latest changes!

## Usage

For full usage instructions on using the `create-ccweb-add-on` CLI, check the [Development Tools](https://developer.adobe.com/express/add-ons/docs/guides/getting_started/dev_tooling/) documentation.
