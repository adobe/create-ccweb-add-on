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

import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import type { Logger } from "@adobe/ccweb-add-on-core";
import { DEFAULT_OUTPUT_DIRECTORY } from "@adobe/ccweb-add-on-core";
import type { AddOnManifestEntrypoint } from "@adobe/ccweb-add-on-manifest";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../../AnalyticsMarkers.js";
import { BuildCommandExecutor } from "../../app/BuildCommandExecutor.js";
import { CleanCommandExecutor } from "../../app/CleanCommandExecutor.js";
import type { ScriptManager } from "../../app/ScriptManager.js";
import { MANIFEST_JSON } from "../../constants.js";
import { AddOnDirectory } from "../../models/AddOnDirectory.js";
import { BuildCommandOptions } from "../../models/BuildCommandOptions.js";
import { AddOnManifestReader } from "../../utilities/AddOnManifestReader.js";
import { createManifest } from "../test-utilities.js";

chai.use(chaiAsPromised);

describe("BuildCommandExecutor", () => {
    let sandbox: SinonSandbox;

    let scriptManager: StubbedInstance<ScriptManager>;

    let cleanCommandExecutor: CleanCommandExecutor;

    let manifestReader: AddOnManifestReader;

    let logger: StubbedInstance<Logger>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    let buildCommandExecutor: BuildCommandExecutor;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, "log");

        scriptManager = stubInterface<ScriptManager>();
        logger = stubInterface<Logger>();
        cleanCommandExecutor = new CleanCommandExecutor(scriptManager, logger, analyticsService);
        manifestReader = new AddOnManifestReader();

        analyticsService = stubInterface<AnalyticsService>();
        analyticsService.postEvent.resolves();

        buildCommandExecutor = new BuildCommandExecutor(
            scriptManager,
            logger,
            cleanCommandExecutor,
            manifestReader,
            analyticsService
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("execute", () => {
        it("should transpile source directory when 'build' script is run with a transpiler.", async () => {
            const options = new BuildCommandOptions("data", "tsc", true);

            sandbox.stub(cleanCommandExecutor, "execute").resolves();

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();
            scriptManager.transpile.withArgs(options.transpiler).resolves(true);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const addOnManifest = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(addOnManifest.manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(manifestPath).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (addOnManifest.manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            const isBuildSuccessful = await buildCommandExecutor.execute(options);

            assert.equal(isBuildSuccessful, true);

            assert.equal(
                logger.information
                    .getCall(0)
                    .calledWith(
                        `Building source directory ${options.srcDirectory}/ to ${DEFAULT_OUTPUT_DIRECTORY}/ ...`
                    ),
                true
            );

            assert.equal(logger.success.callCount, 1);
            assert.equal(
                logger.success.getCall(0).calledWith("Done.", {
                    postfix: "\n"
                }),
                true
            );

            const addOnDirectory = new AddOnDirectory(options.srcDirectory, addOnManifest);
            const analyticsServiceEventData = [
                "--addOnName",
                addOnDirectory.rootDirName,
                "--testId",
                addOnManifest.manifestProperties.testId,
                "--manifestVersion",
                addOnManifest.manifestProperties.manifestVersion,
                "--use",
                options.transpiler
            ];
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsSuccessMarkers.SCRIPTS_BUILD_COMMAND_SUCCESS,
                    analyticsServiceEventData.join(" "),
                    true
                ),
                true
            );
        });

        it("should transpile source directory and return false when 'build' script is run with a transpiler and transpilation fails.", async () => {
            const options = new BuildCommandOptions("data", "tsc", true);

            sandbox.stub(cleanCommandExecutor, "execute").resolves();

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();
            scriptManager.transpile.withArgs(options.transpiler).resolves(false);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(manifestPath).returns(<Stats>{
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

            const isBuildSuccessful = await buildCommandExecutor.execute(options);

            assert.equal(isBuildSuccessful, false);
            assert.equal(logger.success.callCount, 0);
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                    "Build Generation Failed.",
                    false
                ),
                true
            );
        });

        it("should copy static files from source directory when 'build' script is run without a transpiler.", async () => {
            const options = new BuildCommandOptions("data", "", true);

            sandbox.stub(cleanCommandExecutor, "execute").resolves();

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();

            scriptManager.copyStaticFiles.withArgs(options.srcDirectory, DEFAULT_OUTPUT_DIRECTORY).resolves();

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const addOnManifest = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(addOnManifest.manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(manifestPath).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (addOnManifest.manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            await buildCommandExecutor.execute(options);

            assert.equal(
                logger.information
                    .getCall(0)
                    .calledWith(
                        `Building source directory ${options.srcDirectory}/ to ${DEFAULT_OUTPUT_DIRECTORY}/ ...`
                    ),
                true
            );

            assert.equal(logger.success.callCount, 1);
            assert.equal(
                logger.success.getCall(0).calledWith("Done.", {
                    postfix: "\n"
                }),
                true
            );

            const addOnDirectory = new AddOnDirectory(options.srcDirectory, addOnManifest);
            const analyticsServiceEventData = [
                "--addOnName",
                addOnDirectory.rootDirName,
                "--testId",
                addOnManifest.manifestProperties.testId,
                "--manifestVersion",
                addOnManifest.manifestProperties.manifestVersion,
                "--use",
                options.transpiler
            ];
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsSuccessMarkers.SCRIPTS_BUILD_COMMAND_SUCCESS,
                    analyticsServiceEventData.join(" "),
                    true
                ),
                true
            );
        });

        it(`should exit when ${DEFAULT_OUTPUT_DIRECTORY} doesnt exits.`, async () => {
            const options = new BuildCommandOptions("data", "", true);

            sandbox.stub(cleanCommandExecutor, "execute").resolves();

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();

            scriptManager.copyStaticFiles.withArgs(options.srcDirectory, DEFAULT_OUTPUT_DIRECTORY).resolves();

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(false);
            fsExistsSyncStub.withArgs(distPath).returns(false);

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            await expect(buildCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(processExitStub.callCount, 1);

            assert.equal(logger.error.callCount, 3);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find the ${DEFAULT_OUTPUT_DIRECTORY} directory.`),
                true
            );
            assert.equal(logger.error.getCall(2).calledWith(`Please build your add-on.`), true);

            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                    "Add-on manifest validation failed.",
                    false
                ),
                true
            );
        });

        it("should exit when manifest doesnt exits.", async () => {
            const options = new BuildCommandOptions("data", "", true);

            sandbox.stub(cleanCommandExecutor, "execute").resolves();

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();

            scriptManager.copyStaticFiles.withArgs(options.srcDirectory, DEFAULT_OUTPUT_DIRECTORY).resolves();

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(false);

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            await expect(buildCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(processExitStub.callCount, 1);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find ${MANIFEST_JSON} in ${DEFAULT_OUTPUT_DIRECTORY}.`),
                true
            );
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                    "Add-on manifest validation failed.",
                    false
                ),
                true
            );
        });

        it("should exit when manifest validation fails.", async () => {
            const options = new BuildCommandOptions("data", "", true);

            sandbox.stub(cleanCommandExecutor, "execute").resolves();

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();

            scriptManager.copyStaticFiles.withArgs(options.srcDirectory, DEFAULT_OUTPUT_DIRECTORY).resolves();

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(manifestPath).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            manifestProperties.entryPoints = [];
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            await expect(buildCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(processExitStub.callCount, 1);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`/entryPoints - At least one entrypoint should be defined`),
                true
            );
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                    "Add-on manifest validation failed.",
                    false
                ),
                true
            );
        });
    });
});
