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
import { __decorate, __metadata, __param } from "tslib";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import { DEFAULT_HOST_NAME, DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes, getBaseUrl, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import chokidar from "chokidar";
import { inject, injectable } from "inversify";
import path from "path";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import { MANIFEST_JSON, WSS } from "../constants.js";
import { AddOnActionV1, AddOnSourceChangedPayloadV1, CLIScriptMessageV1 } from "../models/index.js";
/**
 * WebSocket server implementation class to handle messaging on the Add-On server.
 */
let WxpSocketServer = class WxpSocketServer {
    _socketAppFactory;
    _entityTracker;
    _scriptManager;
    _manifestReader;
    _logger;
    _analyticsService;
    _watcher;
    /**
     * Instantiate {@link WxpSocketServer}.
     *
     * @param socketAppFactory - {@link SocketAppFactory} reference.
     * @param entityTracker - {@link EntityTracker} reference.
     * @param scriptManager - {@link ScriptManager} reference.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link WxpSocketServer} instance.
     */
    constructor(socketAppFactory, entityTracker, scriptManager, manifestReader, logger, analyticsService) {
        this._socketAppFactory = socketAppFactory;
        this._entityTracker = entityTracker;
        this._scriptManager = scriptManager;
        this._manifestReader = manifestReader;
        this._logger = logger;
        this._analyticsService = analyticsService;
    }
    /**
     * Start the WebSocket server.
     *
     * @param addOnDirectory - {@link AddOnDirectory} Add-on directory information on which the script is executed.
     * @param server - {@link Server} Sever where the Add-on is hosted.
     * @param options - {@link StartCommandOptions} Options which the Add-on is started with.
     */
    async start(addOnDirectory, server, options) {
        const socketApp = this._socketAppFactory(server);
        if (this._watcher !== undefined) {
            await this._watcher.close();
        }
        this._watchForChanges(socketApp, addOnDirectory, options);
        if (options.verbose) {
            this._logger.success(format(LOGS.wssServerStarted, {
                addOnDirectory: addOnDirectory.rootDirName,
                serverUrl: getBaseUrl(WSS, `${DEFAULT_HOST_NAME}:${options.port}`)
            }));
        }
    }
    _watchForChanges(webSocketServer, addOnDirectory, options) {
        this._entityTracker.registerAction(async (addOnChange) => {
            this._analyticsService.startTime = Date.now();
            this._logger.information(format(LOGS.rebuildingSourceDirectory, {
                srcDirectory: addOnDirectory.srcDirName,
                DEFAULT_OUTPUT_DIRECTORY
            }));
            await this._scriptManager.cleanDirectory(DEFAULT_OUTPUT_DIRECTORY);
            const addOnId = addOnChange[0];
            const changedFiles = addOnChange[1];
            const manifestJsonPath = path.join(addOnDirectory.srcDirName, MANIFEST_JSON);
            const hasManifestChanged = changedFiles.has(manifestJsonPath);
            let isBuildSuccessful = true;
            if (!isNullOrWhiteSpace(options.transpiler)) {
                isBuildSuccessful = await this._scriptManager.transpile(options.transpiler);
            }
            else {
                await this._scriptManager.copyStaticFiles(options.srcDirectory, DEFAULT_OUTPUT_DIRECTORY);
            }
            // If the manifest has not changed, get its value from the cache,
            // else read it from file.
            const addOnManifest = await this._manifestReader.getManifest(this._onValidationFailed, !hasManifestChanged);
            if (isBuildSuccessful && addOnManifest !== undefined) {
                this._logger.success(LOGS.done, { postfix: LOGS.newLine });
            }
            else {
                await this._scriptManager.cleanDirectoryAndAddManifest(DEFAULT_OUTPUT_DIRECTORY, manifestJsonPath);
            }
            const message = this._getMessage(addOnId, changedFiles, isBuildSuccessful, hasManifestChanged, addOnManifest);
            webSocketServer.clients.forEach(client => client.send(message.toJSON()));
            if (!isBuildSuccessful || addOnManifest === undefined) {
                this._analyticsService.postEvent(AnalyticsSuccessMarkers.SOURCE_CODE_CHANGED, LOGS.buildFailed, false);
                return;
            }
            this._analyticsService.postEvent(AnalyticsSuccessMarkers.SOURCE_CODE_CHANGED, LOGS.successfullyUpdatedSourceCode, true);
        });
        this._watcher = chokidar.watch(addOnDirectory.srcDirPath, {
            cwd: ".",
            ignored: /(^|[\\])\../,
            ignoreInitial: true,
            persistent: true
        });
        const addOnId = addOnDirectory.manifest.manifestProperties.testId;
        this._watcher
            .on("add", path => this._entityTracker.track(addOnId, path))
            .on("change", path => this._entityTracker.track(addOnId, path))
            .on("unlink", path => this._entityTracker.track(addOnId, path));
    }
    _onValidationFailed = (failedResult) => {
        this._logger.error(LOGS.manifestValidationFailed);
        const { errorDetails } = failedResult;
        if (errorDetails !== undefined && errorDetails.length > 0) {
            errorDetails.forEach((manifestError) => {
                if (!isNullOrWhiteSpace(manifestError?.message)) {
                    this._logger.error(`${!isNullOrWhiteSpace(manifestError?.instancePath) ? `${manifestError.instancePath} - ` : ""}${manifestError.message}`);
                }
            });
        }
        console.log();
        return;
    };
    _getMessage(addOnId, changedFiles, isBuildSuccessful, hasManifestChanged, addOnManifest) {
        let payload;
        if (hasManifestChanged) {
            payload = new AddOnSourceChangedPayloadV1(Array.from(changedFiles), isBuildSuccessful, true, addOnManifest?.manifestProperties);
        }
        else {
            payload = new AddOnSourceChangedPayloadV1(Array.from(changedFiles), isBuildSuccessful, false);
        }
        return new CLIScriptMessageV1(addOnId, AddOnActionV1.SourceCodeChanged, payload);
    }
};
WxpSocketServer = __decorate([
    injectable(),
    __param(0, inject(ITypes.SocketApp)),
    __param(1, inject(ITypes.EntityTracker)),
    __param(2, inject(ITypes.ScriptManager)),
    __param(3, inject(ITypes.AddOnManifestReader)),
    __param(4, inject(ICoreTypes.Logger)),
    __param(5, inject(IAnalyticsTypes.AnalyticsService)),
    __metadata("design:paramtypes", [Function, Object, Object, Function, Object, Object])
], WxpSocketServer);
export { WxpSocketServer };
const LOGS = {
    newLine: "\n",
    wssServerStarted: "Done. Your add-on '{addOnDirectory}' is being watched on: {serverUrl}",
    rebuildingSourceDirectory: "Re-building source directory {srcDirectory}/ to {DEFAULT_OUTPUT_DIRECTORY}/ ...",
    done: "Done.",
    manifestValidationFailed: "Add-on manifest validation failed.",
    buildFailed: "Build failed.",
    successfullyUpdatedSourceCode: "Successfully updated source code."
};
//# sourceMappingURL=WxpSocketServer.js.map