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
import type { SSLReader } from "@adobe/ccweb-add-on-ssl";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type { Express } from "express";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import type { Server } from "https";
import "mocha";
import path from "path";
import process from "process";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../../AnalyticsMarkers.js";
import { BuildCommandExecutor } from "../../app/BuildCommandExecutor.js";
import { CleanCommandExecutor } from "../../app/CleanCommandExecutor.js";
import type { ExpressServer } from "../../app/ExpressServer.js";
import type { ScriptManager } from "../../app/ScriptManager.js";
import type { SocketServer } from "../../app/SocketServer.js";
import type { ServerProvider } from "../../app/StartCommandExecutor.js";
import { StartCommandExecutor } from "../../app/StartCommandExecutor.js";
import { MANIFEST_JSON } from "../../constants.js";
import { AddOnDirectory } from "../../models/AddOnDirectory.js";
import { StartCommandOptions } from "../../models/StartCommandOptions.js";
import { AddOnManifestReader } from "../../utilities/AddOnManifestReader.js";
import { createManifest } from "../test-utilities.js";

chai.use(chaiAsPromised);

describe("StartCommandExecutor", () => {
    let sandbox: SinonSandbox;

    let server: StubbedInstance<Server>;
    let serverProvider: StubbedInstance<ServerProvider>;

    let expressServer: StubbedInstance<ExpressServer>;
    let socketServer: StubbedInstance<SocketServer>;
    let scriptManager: StubbedInstance<ScriptManager>;
    let logger: StubbedInstance<Logger>;
    let sslReader: StubbedInstance<SSLReader>;
    let expressApp: StubbedInstance<Express>;

    let manifestReader: AddOnManifestReader;

    let analyticsService: StubbedInstance<AnalyticsService>;

    let cleanCommandExecutor: CleanCommandExecutor;
    let buildCommandExecutor: BuildCommandExecutor;
    let startCommandExecutor: StartCommandExecutor;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, "log");

        server = stubInterface<Server>();
        serverProvider = sandbox.stub().resolves(server);

        expressApp = stubInterface();
        expressServer = stubInterface();
        socketServer = stubInterface();
        scriptManager = stubInterface();
        logger = stubInterface();

        manifestReader = new AddOnManifestReader();

        sslReader = stubInterface<SSLReader>();
        sslReader.read.resolves();

        analyticsService = stubInterface<AnalyticsService>();
        analyticsService.postEvent.resolves();

        cleanCommandExecutor = new CleanCommandExecutor(scriptManager, logger, analyticsService);

        buildCommandExecutor = new BuildCommandExecutor(
            scriptManager,
            logger,
            cleanCommandExecutor,
            manifestReader,
            analyticsService
        );

        startCommandExecutor = new StartCommandExecutor(
            serverProvider,
            expressServer,
            socketServer,
            buildCommandExecutor,
            manifestReader,
            sslReader,
            logger,
            analyticsService
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("execute", () => {
        const runs = [
            {
                srcDirectory: "src",
                transpiler: "tsc",
                hostname: "localhost",
                port: 5241,
                verbose: true
            },
            {
                srcDirectory: "src",
                transpiler: "webpack",
                hostname: "not.localhost",
                port: 8080,
                verbose: true
            },
            {
                srcDirectory: "src",
                transpiler: "",
                hostname: "localhost",
                port: 5241,
                verbose: true
            },
            {
                srcDirectory: "src",
                transpiler: "webpack",
                hostname: "not.localhost",
                port: 443,
                verbose: true
            }
        ];
        runs.forEach(run => {
            it("should start HTTP and WebSocket server when 'start' script is run.", async () => {
                const options = new StartCommandOptions(
                    run.srcDirectory,
                    run.transpiler,
                    run.hostname,
                    run.port,
                    run.verbose
                );

                sandbox.stub(buildCommandExecutor, "execute").resolves(true);

                expressServer.start.returns();
                socketServer.start.resolves();

                const currentDirectory = "/user/repo/test-app";
                const cwdStub = sandbox.stub(process, "cwd");
                cwdStub.returns(currentDirectory);

                const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
                const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

                const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
                fsExistsSyncStub.withArgs(manifestPath).returns(true);
                fsExistsSyncStub.withArgs(distPath).returns(true);

                const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
                const manifest = createManifest();
                fsReadFileSyncStub.returns(JSON.stringify(manifest.manifestProperties));

                const lstatSyncStub = sandbox.stub(fs, "lstatSync");
                lstatSyncStub.withArgs(distPath).returns(<Stats>{
                    isDirectory: () => {
                        return true;
                    }
                });
                lstatSyncStub.withArgs(manifestPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
                (manifest.manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                    const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                    fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                    lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                        isFile: () => {
                            return true;
                        }
                    });
                });

                await startCommandExecutor.execute(options, expressApp);

                assert.equal(logger.message.callCount, 2);
                assert.equal(logger.message.getCall(0).calledWith("Starting HTTPS Server ..."), true);
                assert.equal(logger.message.getCall(1).calledWith("Starting WSS Server ..."), true);

                assert.equal(logger.information.callCount, 1);
                assert.equal(logger.information.getCall(0).calledWith("Starting Server ..."), true);

                assert.equal(logger.success.callCount, 1);
                assert.equal(
                    logger.success
                        .getCall(0)
                        .calledWith(
                            "Continue testing your add-on in Adobe Express by accessing the link: https://www.adobe.com/go/addon-cli",
                            { prefix: "\n" }
                        ),
                    true
                );
                
                const addonDirectory = new AddOnDirectory(options.srcDirectory, manifest);

                const analyticsServiceEventData = [
                    "--addOnName",
                    addonDirectory.rootDirName,
                    "--testId",
                    manifest.manifestProperties.testId,
                    "--manifestVersion",
                    manifest.manifestProperties.manifestVersion,
                    "--use",
                    options.transpiler,
                    "--hostname",
                    options.hostname,
                    "--port",
                    options.port
                ];
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent
                        .getCall(0)
                        .calledWith(
                            AnalyticsSuccessMarkers.SCRIPTS_START_COMMAND_SUCCESS,
                            analyticsServiceEventData.join(" "),
                            true
                        ),
                    true
                );
            });

            it("should not start HTTP and WebSocket server when 'start' script is run but build failed.", async () => {
                const options = new StartCommandOptions(
                    run.srcDirectory,
                    run.transpiler,
                    run.hostname,
                    run.port,
                    run.verbose
                );

                sandbox.stub(buildCommandExecutor, "execute").resolves(false);

                expressServer.start.returns();
                socketServer.start.resolves();

                const cwdStub = sandbox.stub(process, "cwd");
                cwdStub.returns(options.srcDirectory);

                await startCommandExecutor.execute(options, expressApp);

                assert.equal(expressServer.start.callCount, 0);
                assert.equal(socketServer.start.callCount, 0);

                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent
                        .getCall(0)
                        .calledWith(
                            AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR,
                            "Error while generating build.",
                            false
                        ),
                    true
                );
            });
        });

        it(`should exit when ${DEFAULT_OUTPUT_DIRECTORY} doesn't exist.`, async () => {
            startCommandExecutor = new StartCommandExecutor(
                serverProvider,
                expressServer,
                socketServer,
                buildCommandExecutor,
                manifestReader,
                sslReader,
                logger,
                analyticsService
            );
            const options = new StartCommandOptions("src", "tsc", "localhost", 3000, true);

            sandbox.stub(buildCommandExecutor, "execute").resolves(true);

            expressServer.start.returns();
            socketServer.start.resolves();

            const currentDirectory = "/user/repo/test-app";
            const cwdStub = sandbox.stub(process, "cwd");
            cwdStub.returns(currentDirectory);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(false);
            fsExistsSyncStub.withArgs(manifestPath).returns(true);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            const stats = <Stats>{
                isDirectory: () => {
                    return true;
                }
            };
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(stats);

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.withArgs(1).throws();

            const startExecutor = () => startCommandExecutor.execute(options, expressApp);
            await expect(startExecutor()).to.be.rejectedWith();

            assert.equal(processExitStub.callCount, 1);
            assert.equal(processExitStub.getCall(0).calledWith(1), true);

            assert.equal(logger.error.callCount, 3);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find the ${DEFAULT_OUTPUT_DIRECTORY} directory.`),
                true
            );
            assert.equal(logger.error.getCall(2).calledWith(`Please build your add-on.`), true);

            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent
                    .getCall(0)
                    .calledWith(
                        AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR,
                        "Add-on manifest validation failed.",
                        false
                    ),
                true
            );
        });

        it("should exit when manifest doesn't exist.", async () => {
            startCommandExecutor = new StartCommandExecutor(
                serverProvider,
                expressServer,
                socketServer,
                buildCommandExecutor,
                manifestReader,
                sslReader,
                logger,
                analyticsService
            );
            const options = new StartCommandOptions("src", "tsc", "localhost", 3000, true);

            sandbox.stub(buildCommandExecutor, "execute").resolves(true);

            expressServer.start.returns();
            socketServer.start.resolves();

            const currentDirectory = "/user/repo/test-app";
            const cwdStub = sandbox.stub(process, "cwd");
            cwdStub.returns(currentDirectory);

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
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(stats);

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.withArgs(1).throws();

            const startExecutor = () => startCommandExecutor.execute(options, expressApp);
            await expect(startExecutor()).to.be.rejectedWith();

            assert.equal(processExitStub.callCount, 1);
            assert.equal(processExitStub.getCall(0).calledWith(1), true);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find ${MANIFEST_JSON} in ${DEFAULT_OUTPUT_DIRECTORY}.`),
                true
            );

            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent
                    .getCall(0)
                    .calledWith(
                        AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR,
                        "Add-on manifest validation failed.",
                        false
                    ),
                true
            );
        });

        it("should exit when manifest validation fails.", async () => {
            startCommandExecutor = new StartCommandExecutor(
                serverProvider,
                expressServer,
                socketServer,
                buildCommandExecutor,
                manifestReader,
                sslReader,
                logger,
                analyticsService
            );
            const options = new StartCommandOptions("src", "tsc", "localhost", 3000, true);

            sandbox.stub(buildCommandExecutor, "execute").resolves(true);

            expressServer.start.returns();
            socketServer.start.resolves();

            const currentDirectory = "/user/repo/test-app";
            const cwdStub = sandbox.stub(process, "cwd");
            cwdStub.returns(currentDirectory);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(distPath).returns(<Stats>{
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
            processExitStub.withArgs(1).throws();

            const startExecutor = () => startCommandExecutor.execute(options, expressApp);
            await expect(startExecutor()).to.be.rejectedWith();

            assert.equal(processExitStub.callCount, 1);
            assert.equal(processExitStub.getCall(0).calledWith(1), true);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`/entryPoints - At least one entrypoint should be defined`),
                true
            );

            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent
                    .getCall(0)
                    .calledWith(
                        AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR,
                        "Add-on manifest validation failed.",
                        false
                    ),
                true
            );
        });
    });
});
