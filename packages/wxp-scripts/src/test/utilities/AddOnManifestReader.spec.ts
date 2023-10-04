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

import type { Logger } from "@adobe/ccweb-add-on-core";
import { DEFAULT_OUTPUT_DIRECTORY, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import type { AccountService } from "@adobe/ccweb-add-on-developer-terms";
import type { AddOnManifestEntrypoint, ManifestError, ManifestValidationResult } from "@adobe/ccweb-add-on-manifest";
import { assert } from "chai";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { MANIFEST_JSON } from "../../constants.js";
import { AddOnManifestReader } from "../../utilities/index.js";
import { createManifest } from "../test-utilities.js";

describe("AddOnManifestReader", () => {
    let sandbox: SinonSandbox;

    let logger: StubbedInstance<Logger>;

    let accountService: StubbedInstance<AccountService>;
    let addOnManifestReader: AddOnManifestReader;

    const handleValidationFailed = async (failedResult: ManifestValidationResult) => {
        logger.error("Add-on manifest validation failed.");

        const { errorDetails } = failedResult;
        errorDetails?.forEach((manifestError?: ManifestError) => {
            if (!isNullOrWhiteSpace(manifestError?.message)) {
                logger.error(
                    `${!isNullOrWhiteSpace(manifestError?.instancePath) ? `${manifestError!.instancePath} - ` : ""}${
                        manifestError!.message
                    }`
                );
            }
        });
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        logger = stubInterface<Logger>();

        accountService = stubInterface();
        accountService.isUserPrivileged.resolves(true);

        addOnManifestReader = new AddOnManifestReader(accountService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("getAddOns", () => {
        const { manifestProperties } = createManifest();

        it("should return manifest if all the validations are passed.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(distPath).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            const addOnManifest = await addOnManifestReader.getManifest(handleValidationFailed);

            assert.deepEqual(manifestProperties, addOnManifest?.manifestProperties);
        });

        it("should return manifest from cache if the getFromCache flag is true.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(distPath).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            const addOnManifestOriginal = await addOnManifestReader.getManifest(handleValidationFailed);
            assert.deepEqual(manifestProperties, addOnManifestOriginal?.manifestProperties);

            const addOnManifestCached = await addOnManifestReader.getManifest(
                async (error: ManifestValidationResult) => {
                    logger.error(error?.errorDetails?.[0].message);
                }
            );

            assert.deepEqual(addOnManifestCached?.manifestProperties, addOnManifestOriginal?.manifestProperties);
        });

        it(`should return error if ${DEFAULT_OUTPUT_DIRECTORY} doesn't exist.`, async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(false);
            fsExistsSyncStub.withArgs(manifestPath).returns(false);

            await addOnManifestReader.getManifest(handleValidationFailed);

            assert.equal(logger.error.callCount, 3);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find the ${DEFAULT_OUTPUT_DIRECTORY} directory.`),
                true
            );
            assert.equal(logger.error.getCall(2).calledWith(`Please build your add-on.`), true);
        });

        it(`should return error if ${DEFAULT_OUTPUT_DIRECTORY} is not a directory.`, async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(false);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            const stats = <Stats>{
                isDirectory: () => {
                    return false;
                }
            };
            lstatSyncStub.withArgs(distPath).returns(stats);

            await addOnManifestReader.getManifest(handleValidationFailed);

            assert.equal(logger.error.callCount, 3);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find the ${DEFAULT_OUTPUT_DIRECTORY} directory.`),
                true
            );
            assert.equal(logger.error.getCall(2).calledWith(`Please build your add-on.`), true);
        });

        it("should return error if manifest doesnt exist.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(false);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            const stats = <Stats>{
                isDirectory: () => {
                    return true;
                }
            };
            lstatSyncStub.withArgs(distPath).returns(stats);

            await addOnManifestReader.getManifest(handleValidationFailed);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find ${MANIFEST_JSON} in ${DEFAULT_OUTPUT_DIRECTORY}.`),
                true
            );
        });

        it("should return error if manifest is not a file.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(true);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");

            lstatSyncStub.withArgs(distPath).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(manifestPath).returns(<Stats>{
                isFile: () => {
                    return false;
                }
            });

            await addOnManifestReader.getManifest(handleValidationFailed);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find ${MANIFEST_JSON} in ${DEFAULT_OUTPUT_DIRECTORY}.`),
                true
            );
        });

        it("should return error if manifest is empty.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            fsReadFileSyncStub.returns("");

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(distPath).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });

            await addOnManifestReader.getManifest(handleValidationFailed);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(logger.error.getCall(1).calledWith(`${MANIFEST_JSON} is empty.`), true);
        });

        it("should return error if manifest is incorrect.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            manifestProperties.entryPoints = [];
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(distPath).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });

            await addOnManifestReader.getManifest(handleValidationFailed);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith("/entryPoints - At least one entrypoint should be defined"),
                true
            );
        });

        it("should return error if manifest has a syntax error.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            fsReadFileSyncStub.returns('{"a:1}');

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(distPath).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });

            await addOnManifestReader.getManifest(handleValidationFailed);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(logger.error.getCall(1).calledWith(`JSON format error in ${MANIFEST_JSON}`), true);
        });
    });
});
