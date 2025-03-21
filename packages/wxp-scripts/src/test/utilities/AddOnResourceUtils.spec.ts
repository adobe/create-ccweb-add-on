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

import type { AddOnListingData } from "@adobe/ccweb-add-on-core";
import { DEFAULT_HOST_NAME, DEFAULT_OUTPUT_DIRECTORY, getBaseUrl } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import type { Dirent, Stats } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import { DEFAULT_ADD_ON_NAME, HTTPS, MANIFEST_JSON } from "../../constants.js";
import { AddOnDirectory, StartCommandOptions } from "../../models/index.js";
import { AddOnResourceUtils } from "../../utilities/index.js";
import { createCommandManifest, createManifest } from "../test-utilities.js";

describe("AddOnResourceUtils", () => {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("getAddOnListingData", () => {
        it("should return add-on listing data for panel entrypoint.", () => {
            const options = new StartCommandOptions("src", "tsc", "localhost", 5241, true);
            const addOnDirectory = new AddOnDirectory("src", createManifest());

            const expectedAddOnsJson: AddOnListingData[] = [
                {
                    addonId: "test-app",
                    versionString: "1.0.0",
                    supportedLanguages: ["en-US"],
                    supportedApps: ["Express"],
                    downloadUrl: `${getBaseUrl(HTTPS, DEFAULT_HOST_NAME, options.port)}/test-app/${MANIFEST_JSON}`,
                    addon: {
                        localizedMetadata: {
                            name: "Test App"
                        }
                    },
                    entryPoints: [
                        {
                            id: "panel1",
                            type: "panel",
                            main: "index.html",
                            discoverable: true
                        }
                    ]
                }
            ];

            const addOnsJson = AddOnResourceUtils.getAddOnListingData(
                createManifest(),
                addOnDirectory,
                getBaseUrl(HTTPS, DEFAULT_HOST_NAME, options.port)
            );

            assert.deepEqual(addOnsJson, expectedAddOnsJson);
        });

        it("should return add-on listing data for command entrypoint.", () => {
            const options = new StartCommandOptions("src", "tsc", "localhost", 5241, true);
            const addOnDirectory = new AddOnDirectory("src", createManifest());

            const expectedAddOnsJson: AddOnListingData[] = [
                {
                    addonId: "test-app",
                    versionString: "1.0.0",
                    supportedLanguages: ["en-US"],
                    supportedApps: ["Express"],
                    downloadUrl: `${getBaseUrl(HTTPS, DEFAULT_HOST_NAME, options.port)}/test-app/${MANIFEST_JSON}`,
                    addon: {
                        localizedMetadata: {
                            name: "Test App"
                        }
                    },
                    entryPoints: [
                        {
                            type: "command",
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
                }
            ];

            const addOnsJson = AddOnResourceUtils.getAddOnListingData(
                createCommandManifest(),
                addOnDirectory,
                getBaseUrl(HTTPS, DEFAULT_HOST_NAME, options.port)
            );

            assert.deepEqual(addOnsJson, expectedAddOnsJson);
        });

        it("should return add-on listing data and fallback to manifest available in addon directory when manifest validation fails.", () => {
            const options = new StartCommandOptions("src", "tsc", "localhost", 5241, true);
            const addOnDirectory = new AddOnDirectory("src", createManifest());

            const expectedAddOnsJson = [
                {
                    addonId: "test-app",
                    versionString: "1.0.0",
                    supportedLanguages: ["en-US"],
                    supportedApps: ["Express"],
                    downloadUrl: `${getBaseUrl(HTTPS, DEFAULT_HOST_NAME, options.port)}/test-app/${MANIFEST_JSON}`,
                    addon: {
                        localizedMetadata: {
                            name: DEFAULT_ADD_ON_NAME
                        }
                    },
                    entryPoints: []
                }
            ];

            const addOnsJson = AddOnResourceUtils.getAddOnListingData(
                undefined!,
                addOnDirectory,
                getBaseUrl(HTTPS, DEFAULT_HOST_NAME, options.port)
            );

            assert.deepEqual(addOnsJson, expectedAddOnsJson);
        });
    });

    describe("getResources", () => {
        it("should return resources from DEFAULT_OUTPUT_DIRECTORY.", () => {
            const addOnDirectory = new AddOnDirectory("src", createManifest());
            const options = new StartCommandOptions("src", "", "localhost", 5241, true);

            const baseUrl = getBaseUrl(HTTPS, DEFAULT_HOST_NAME, options.port);
            const expectedResources = [
                `${baseUrl}/${addOnDirectory.manifest.manifestProperties.testId}/file-1.js`,
                `${baseUrl}/${addOnDirectory.manifest.manifestProperties.testId}/file-2.css`,
                `${baseUrl}/${addOnDirectory.manifest.manifestProperties.testId}/file-3.html`
            ];

            const readDirStub = sandbox.stub(fs, "readdirSync");
            const resourcesInDestinationDirectory = [
                { name: "file-1.js" },
                { name: "file-2.css" },
                { name: "file-3.html" },
                { name: ".DS_Store" },
                { name: ".logs" }
            ] as Dirent[];
            readDirStub
                .withArgs(path.join(addOnDirectory.rootDirPath, DEFAULT_OUTPUT_DIRECTORY), {
                    withFileTypes: true
                })
                .returns(resourcesInDestinationDirectory);

            const lstatStub = sandbox.stub(fs, "lstatSync");
            const stats = <Stats>{
                isDirectory: () => {
                    return false;
                }
            };
            lstatStub.returns(stats);

            const resources = AddOnResourceUtils.getResources(createManifest(), addOnDirectory.rootDirPath, baseUrl);

            assert.deepEqual(resources, expectedResources);
        });
    });
});
