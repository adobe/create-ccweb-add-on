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
import { DEFAULT_HOST_NAME, DEFAULT_OUTPUT_DIRECTORY, getBaseUrl, getJSONString } from "@adobe/ccweb-add-on-core";
import type { AddOnManifestEntrypoint } from "@adobe/ccweb-add-on-manifest";
import { assert } from "chai";
import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import type { Server } from "https";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { WebSocket, WebSocketServer } from "ws";
import { AnalyticsSuccessMarkers } from "../../AnalyticsMarkers.js";
import type { ScriptManager } from "../../app/ScriptManager.js";
import type { SocketAppFactory } from "../../app/SocketServer.js";
import { SocketServer } from "../../app/SocketServer.js";
import { MANIFEST_JSON, WSS } from "../../constants.js";
import { AddOnDirectory } from "../../models/AddOnDirectory.js";
import { AddOnActionV1 } from "../../models/CLIScriptMessageV1.js";
import { StartCommandOptions } from "../../models/StartCommandOptions.js";
import { AddOnManifestReader } from "../../utilities/AddOnManifestReader.js";
import { FileChangeTracker } from "../../utilities/FileChangeTracker.js";
import { createManifest } from "../test-utilities.js";
import { GlobalOverrides } from "../../utilities/GlobalOverrides.js";

describe("SocketServer", () => {
    let sandbox: SinonSandbox;

    let server: StubbedInstance<Server>;

    let socketClient1: StubbedInstance<WebSocket>;
    let socketClient2: StubbedInstance<WebSocket>;
    let socketApp: StubbedInstance<WebSocketServer>;
    let socketAppFactory: StubbedInstance<SocketAppFactory>;

    let scriptManager: StubbedInstance<ScriptManager>;

    let fileChangeTracker: FileChangeTracker;

    let manifestReader: AddOnManifestReader;

    let logger: StubbedInstance<Logger>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    let socketServer: SocketServer;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, "log");

        server = stubInterface<Server>();

        socketClient1 = stubInterface();
        socketClient2 = stubInterface();
        socketApp = stubInterface();
        socketApp.clients = new Set([socketClient1, socketClient2]);
        socketAppFactory = sandbox.stub().returns(socketApp);

        scriptManager = stubInterface();
        fileChangeTracker = new FileChangeTracker();
        manifestReader = new AddOnManifestReader();
        logger = stubInterface<Logger>();

        analyticsService = stubInterface<AnalyticsService>();
        analyticsService.postEvent.resolves();

        socketServer = new SocketServer(
            socketAppFactory,
            fileChangeTracker,
            scriptManager,
            manifestReader,
            logger,
            analyticsService
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("start", () => {
        const runs = [
            { transpiler: "webpack", isBuildSuccessful: true },
            { transpiler: "random", isBuildSuccessful: false }
        ];
        runs.forEach(run => {
            it(`should start WebSocket server and transpile when watched directory has updates when transpiler has value: ${run.transpiler}.`, async () => {
                const manifest = createManifest();
                const addOnDirectory = new AddOnDirectory("src", manifest);

                const options = new StartCommandOptions("src", run.transpiler, "localhost", 5241, true);

                scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();

                scriptManager.transpile.withArgs(options.transpiler).resolves(run.isBuildSuccessful);

                socketClient1.send.returns();
                socketClient2.send.returns();
                socketApp.clients = new Set([socketClient1, socketClient2]);

                const watcher = stubInterface<FSWatcher>();
                watcher.on.returns(watcher);
                watcher.close.resolves();

                const watchStub = sandbox.stub(chokidar, "watch");
                watchStub.returns(watcher);

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
                const overrideGlobalConsoleStub = sandbox.stub(GlobalOverrides, "overrideGlobalConsole");
                sandbox.stub(manifestReader, "getManifest").returns(manifest);

                await socketServer.start(addOnDirectory, server, options);

                assert.equal(logger.success.callCount, 1);
                assert.equal(
                    logger.success.calledWith(
                        `Done. Your add-on '${addOnDirectory.rootDirName}' is being watched on: ${getBaseUrl(
                            WSS,
                            DEFAULT_HOST_NAME,
                            options.port
                        )}`
                    ),
                    true
                );

                fileChangeTracker.track("sample-add-on", "src/index.ts");
                await sleep(fileChangeTracker.throttleTime);

                assert.equal(watcher.on.callCount, 3);
                assert.equal(watcher.on.getCall(0).args[0], "add");
                assert.equal(watcher.on.getCall(1).args[0], "change");
                assert.equal(watcher.on.getCall(2).args[0], "unlink");

                assert.equal(logger.information.callCount, 1);
                assert.equal(
                    logger.information
                        .getCall(0)
                        .calledWith(
                            `Re-building source directory ${addOnDirectory.srcDirName}/ to ${DEFAULT_OUTPUT_DIRECTORY}/ ...`
                        ),
                    true
                );

                if (run.isBuildSuccessful) {
                    assert.equal(logger.success.callCount, 2);
                    assert.equal(
                        logger.success.getCall(1).calledWith("Done.", {
                            postfix: "\n"
                        }),
                        true
                    );
                    assert.equal(analyticsService.postEvent.callCount, 1);
                    assert.equal(overrideGlobalConsoleStub.calledWith(manifest, addOnDirectory), true);
                }

                const cliScriptMessage = {
                    messageVersion: 1,
                    id: "sample-add-on",
                    action: AddOnActionV1.SourceCodeChanged,
                    payload: {
                        changedFiles: ["src/index.ts"],
                        isBuildSuccessful: run.isBuildSuccessful,
                        isManifestChanged: false
                    }
                };

                assert.equal(socketClient1.send.calledWith(getJSONString(cliScriptMessage)), true);
                assert.equal(socketClient2.send.calledWith(getJSONString(cliScriptMessage)), true);
                assert.equal(analyticsService.postEvent.callCount, 1);
            });
        });

        it("should start WebSocket server and copy static files when watched directory has updates and transpiler does not have any value.", async () => {
            const manifest = createManifest();
            const addOnDirectory = new AddOnDirectory("src", manifest);
            const options = new StartCommandOptions("src", "", "localhost", 5241, true);

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();

            scriptManager.copyStaticFiles.withArgs(addOnDirectory.srcDirName, DEFAULT_OUTPUT_DIRECTORY).resolves();

            socketClient1.send.returns();
            socketClient2.send.returns();
            socketApp.clients = new Set([socketClient1, socketClient2]);

            const watchStub = sandbox.stub(chokidar, "watch");
            const watcher = stubInterface<FSWatcher>();
            watcher.on.returns(watcher);
            watchStub.returns(watcher);

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
            const overrideGlobalConsoleStub = sandbox.stub(GlobalOverrides, "overrideGlobalConsole");
            sandbox.stub(manifestReader, "getManifest").returns(manifest);

            await socketServer.start(addOnDirectory, server, options);

            assert.equal(logger.success.callCount, 1);
            assert.equal(
                logger.success.calledWith(
                    `Done. Your add-on '${addOnDirectory.rootDirName}' is being watched on: ${getBaseUrl(
                        WSS,
                        DEFAULT_HOST_NAME,
                        options.port
                    )}`
                ),
                true
            );

            fileChangeTracker.track("sample-add-on", `src/${MANIFEST_JSON}`);
            fileChangeTracker.track("sample-add-on", `src/index.js`);
            await sleep(fileChangeTracker.throttleTime);

            assert.equal(watcher.on.callCount, 3);
            assert.equal(watcher.on.getCall(0).args[0], "add");
            assert.equal(watcher.on.getCall(1).args[0], "change");
            assert.equal(watcher.on.getCall(2).args[0], "unlink");

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information
                    .getCall(0)
                    .calledWith(
                        `Re-building source directory ${addOnDirectory.srcDirName}/ to ${DEFAULT_OUTPUT_DIRECTORY}/ ...`
                    ),
                true
            );

            assert.equal(logger.success.callCount, 2);
            assert.equal(
                logger.success.getCall(1).calledWith("Done.", {
                    postfix: "\n"
                }),
                true
            );
            assert.equal(overrideGlobalConsoleStub.calledWith(manifest, addOnDirectory), true);

            const cliScriptMessage = {
                messageVersion: 1,
                id: "sample-add-on",
                action: AddOnActionV1.SourceCodeChanged,
                payload: {
                    changedFiles: ["src/manifest.json", "src/index.js"],
                    isBuildSuccessful: true,
                    isManifestChanged: true,
                    manifest: manifest.manifestProperties
                }
            };

            assert.equal(socketClient1.send.calledWith(getJSONString(cliScriptMessage)), true);
            assert.equal(socketClient2.send.calledWith(getJSONString(cliScriptMessage)), true);

            await socketServer.start(addOnDirectory, server, options);
            assert.equal(watcher.close.callCount, 1);

            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent
                    .getCall(0)
                    .calledWith(AnalyticsSuccessMarkers.SOURCE_CODE_CHANGED, "Successfully updated source code.", true),
                true
            );
        });

        it(`should exit if the ${DEFAULT_OUTPUT_DIRECTORY} doesn't exist.`, async () => {
            const manifest = createManifest();
            const sourceDirectory = "src";
            const manifestJsonPath = path.join(sourceDirectory, MANIFEST_JSON);

            const addOnDirectory = new AddOnDirectory(sourceDirectory, manifest);
            const options = new StartCommandOptions(sourceDirectory, "", "", 5241, true);

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();
            scriptManager.cleanDirectoryAndAddManifest.withArgs(DEFAULT_OUTPUT_DIRECTORY, manifestJsonPath).resolves();

            scriptManager.copyStaticFiles.withArgs(addOnDirectory.srcDirName, DEFAULT_OUTPUT_DIRECTORY).resolves();

            socketClient1.send.returns();
            socketClient2.send.returns();
            socketApp.clients = new Set([socketClient1, socketClient2]);

            const watchStub = sandbox.stub(chokidar, "watch");
            const watcher = stubInterface<FSWatcher>();
            watcher.on.returns(watcher);
            watchStub.returns(watcher);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(false);
            fsExistsSyncStub.withArgs(manifestPath).returns(false);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            const stats = <Stats>{
                isDirectory: () => {
                    return true;
                }
            };
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(stats);

            await socketServer.start(addOnDirectory, server, options);

            assert.equal(logger.success.callCount, 1);
            assert.equal(
                logger.success.calledWith(
                    `Done. Your add-on '${addOnDirectory.rootDirName}' is being watched on: ${getBaseUrl(
                        WSS,
                        DEFAULT_HOST_NAME,
                        options.port
                    )}`
                ),
                true
            );

            fileChangeTracker.track("sample-add-on", manifestJsonPath);
            fileChangeTracker.track("sample-add-on", `${sourceDirectory}/index.js`);
            await sleep(fileChangeTracker.throttleTime);

            assert.equal(watcher.on.callCount, 3);
            assert.equal(watcher.on.getCall(0).args[0], "add");
            assert.equal(watcher.on.getCall(1).args[0], "change");
            assert.equal(watcher.on.getCall(2).args[0], "unlink");

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information
                    .getCall(0)
                    .calledWith(
                        `Re-building source directory ${addOnDirectory.srcDirName}/ to ${DEFAULT_OUTPUT_DIRECTORY}/ ...`
                    ),
                true
            );

            assert.equal(logger.success.callCount, 1);
            assert.equal(scriptManager.cleanDirectory.calledWith(DEFAULT_OUTPUT_DIRECTORY), true);
            assert.equal(scriptManager.cleanDirectoryAndAddManifest.calledWith(DEFAULT_OUTPUT_DIRECTORY), true);

            const cliScriptMessage = {
                messageVersion: 1,
                id: "sample-add-on",
                action: AddOnActionV1.SourceCodeChanged,
                payload: {
                    changedFiles: [manifestJsonPath, `${sourceDirectory}/index.js`],
                    isBuildSuccessful: true,
                    isManifestChanged: true
                }
            };

            assert.equal(socketClient1.send.calledWith(getJSONString(cliScriptMessage)), true);

            await socketServer.start(addOnDirectory, server, options);
            assert.equal(watcher.close.callCount, 1);

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
                    .calledWith(AnalyticsSuccessMarkers.SOURCE_CODE_CHANGED, "Build failed.", false),
                true
            );
        });

        it("should exit if the manifest doesn't exist.", async () => {
            const manifest = createManifest();
            const sourceDirectory = "src";
            const manifestJsonPath = path.join(sourceDirectory, MANIFEST_JSON);

            const addOnDirectory = new AddOnDirectory(sourceDirectory, manifest);
            const options = new StartCommandOptions(sourceDirectory, "", "", 5241, true);

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();
            scriptManager.cleanDirectoryAndAddManifest.withArgs(DEFAULT_OUTPUT_DIRECTORY, manifestJsonPath).resolves();

            scriptManager.copyStaticFiles.withArgs(addOnDirectory.srcDirName, DEFAULT_OUTPUT_DIRECTORY).resolves();

            socketClient1.send.returns();
            socketClient2.send.returns();
            socketApp.clients = new Set([socketClient1, socketClient2]);

            const watchStub = sandbox.stub(chokidar, "watch");
            const watcher = stubInterface<FSWatcher>();
            watcher.on.returns(watcher);
            watchStub.returns(watcher);

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

            await socketServer.start(addOnDirectory, server, options);

            assert.equal(logger.success.callCount, 1);
            assert.equal(
                logger.success.calledWith(
                    `Done. Your add-on '${addOnDirectory.rootDirName}' is being watched on: ${getBaseUrl(
                        WSS,
                        DEFAULT_HOST_NAME,
                        options.port
                    )}`
                ),
                true
            );

            fileChangeTracker.track("sample-add-on", manifestJsonPath);
            fileChangeTracker.track("sample-add-on", `${sourceDirectory}/index.js`);
            await sleep(fileChangeTracker.throttleTime);

            assert.equal(watcher.on.callCount, 3);
            assert.equal(watcher.on.getCall(0).args[0], "add");
            assert.equal(watcher.on.getCall(1).args[0], "change");
            assert.equal(watcher.on.getCall(2).args[0], "unlink");

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information
                    .getCall(0)
                    .calledWith(
                        `Re-building source directory ${addOnDirectory.srcDirName}/ to ${DEFAULT_OUTPUT_DIRECTORY}/ ...`
                    ),
                true
            );

            assert.equal(logger.success.callCount, 1);
            assert.equal(scriptManager.cleanDirectory.calledWith(DEFAULT_OUTPUT_DIRECTORY), true);
            assert.equal(scriptManager.cleanDirectoryAndAddManifest.calledWith(DEFAULT_OUTPUT_DIRECTORY), true);

            const cliScriptMessage = {
                messageVersion: 1,
                id: "sample-add-on",
                action: AddOnActionV1.SourceCodeChanged,
                payload: {
                    changedFiles: [manifestJsonPath, `${sourceDirectory}/index.js`],
                    isBuildSuccessful: true,
                    isManifestChanged: true
                }
            };

            assert.equal(socketClient1.send.calledWith(getJSONString(cliScriptMessage)), true);

            await socketServer.start(addOnDirectory, server, options);
            assert.equal(watcher.close.callCount, 1);

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
                    .calledWith(AnalyticsSuccessMarkers.SOURCE_CODE_CHANGED, "Build failed.", false),
                true
            );
        });

        it("should exit if the manifest is not valid.", async () => {
            const manifest = createManifest();
            const sourceDirectory = "src";
            const manifestJsonPath = path.join(sourceDirectory, MANIFEST_JSON);

            const addOnDirectory = new AddOnDirectory(sourceDirectory, manifest);
            const options = new StartCommandOptions(sourceDirectory, "", "localhost", 5241, true);

            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();
            scriptManager.cleanDirectoryAndAddManifest.withArgs(DEFAULT_OUTPUT_DIRECTORY, manifestJsonPath).resolves();

            scriptManager.copyStaticFiles.withArgs(addOnDirectory.srcDirName, DEFAULT_OUTPUT_DIRECTORY).resolves();

            socketClient1.send.returns();
            socketClient2.send.returns();
            socketApp.clients = new Set([socketClient1, socketClient2]);

            const watchStub = sandbox.stub(chokidar, "watch");
            const watcher = stubInterface<FSWatcher>();
            watcher.on.returns(watcher);
            watchStub.returns(watcher);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            manifestProperties.entryPoints = [];
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });

            await socketServer.start(addOnDirectory, server, options);

            assert.equal(logger.success.callCount, 1);
            assert.equal(
                logger.success.calledWith(
                    `Done. Your add-on '${addOnDirectory.rootDirName}' is being watched on: ${getBaseUrl(
                        WSS,
                        DEFAULT_HOST_NAME,
                        options.port
                    )}`
                ),
                true
            );

            fileChangeTracker.track("sample-add-on", manifestJsonPath);
            fileChangeTracker.track("sample-add-on", `${sourceDirectory}/index.js`);
            await sleep(fileChangeTracker.throttleTime);

            assert.equal(watcher.on.callCount, 3);
            assert.equal(watcher.on.getCall(0).args[0], "add");
            assert.equal(watcher.on.getCall(1).args[0], "change");
            assert.equal(watcher.on.getCall(2).args[0], "unlink");

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information
                    .getCall(0)
                    .calledWith(
                        `Re-building source directory ${addOnDirectory.srcDirName}/ to ${DEFAULT_OUTPUT_DIRECTORY}/ ...`
                    ),
                true
            );

            assert.equal(logger.success.callCount, 1);
            assert.equal(scriptManager.cleanDirectory.calledWith(DEFAULT_OUTPUT_DIRECTORY), true);
            assert.equal(scriptManager.cleanDirectoryAndAddManifest.calledWith(DEFAULT_OUTPUT_DIRECTORY), true);

            const cliScriptMessage = {
                messageVersion: 1,
                id: "sample-add-on",
                action: AddOnActionV1.SourceCodeChanged,
                payload: {
                    changedFiles: [manifestJsonPath, `${sourceDirectory}/index.js`],
                    isBuildSuccessful: true,
                    isManifestChanged: true
                }
            };

            assert.equal(socketClient1.send.calledWith(getJSONString(cliScriptMessage)), true);

            await socketServer.start(addOnDirectory, server, options);
            assert.equal(watcher.close.callCount, 1);

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
                    .calledWith(AnalyticsSuccessMarkers.SOURCE_CODE_CHANGED, "Build failed.", false),
                true
            );
        });
    });
});

function sleep(timeInMs: number) {
    return new Promise(resolve => setTimeout(resolve, timeInMs));
}
