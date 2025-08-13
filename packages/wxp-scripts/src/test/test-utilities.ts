/********************************************************************************
 * MIT License

 * © Copyright 2023 Adobe. All rights reserved.

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ********************************************************************************/

import { ADDITIONAL_ADD_ON_INFO } from "@adobe/ccweb-add-on-core";
import { AddOnManifest } from "@adobe/ccweb-add-on-manifest";

export function createManifest(): AddOnManifest {
    const { manifest } = AddOnManifest.createManifest({
        manifest: {
            testId: "test-app",
            name: "Test App",
            version: "1.0.0",
            manifestVersion: 2,
            requirements: {
                apps: [
                    {
                        name: "Express",
                        apiVersion: 1
                    }
                ]
            },
            entryPoints: [
                {
                    type: "panel",
                    id: "panel1",
                    main: "index.html"
                }
            ]
        },
        additionalInfo: ADDITIONAL_ADD_ON_INFO
    });

    return manifest!;
}

export function createScriptManifest(): AddOnManifest {
    const { manifest } = AddOnManifest.createManifest({
        manifest: {
            testId: "test-app",
            name: "Test App",
            version: "1.0.0",
            manifestVersion: 2,
            requirements: {
                apps: [
                    {
                        name: "Express",
                        apiVersion: 1
                    }
                ]
            },
            entryPoints: [
                {
                    type: "script",
                    id: "assetProvider",
                    main: "command.html",
                    commands: [
                        {
                            name: "getAssets",
                            supportedMimeTypes: ["image/jpeg", "image/png", "image/bmp"],
                            discoverable: true
                        }
                    ],
                    permissions: {
                        oauth: ["accounts.google.com"]
                    },
                    discoverable: false
                }
            ]
        },
        additionalInfo: ADDITIONAL_ADD_ON_INFO
    });

    return manifest!;
}
