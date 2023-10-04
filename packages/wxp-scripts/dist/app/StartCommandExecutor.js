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
import { ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import { ITypes as ISSLTypes } from "@adobe/ccweb-add-on-ssl";
import { inject, injectable, named } from "inversify";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import { AddOnDirectory } from "../models/AddOnDirectory.js";
/**
 * Start command executor.
 */
let StartCommandExecutor = class StartCommandExecutor {
    _serverProvider;
    _expressServer;
    _socketServer;
    _buildCommandExecutor;
    _manifestReader;
    _sslReader;
    _logger;
    _analyticsService;
    /**
     * Instantiate {@link StartCommandExecutor}.
     * @param serverProvider - {@link ServerProvider} reference.
     * @param expressServer - {@link ExpressServer} reference.
     * @param socketServer - {@link SocketServer} reference.
     * @param buildCommandExecutor - {@link CommandExecutor} reference.
     * @param manifestReader - {@link AddOnManifestReader} reference.
     * @param sslReader - {@link SSLReader} reference.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link StartCommandExecutor} instance.
     */
    constructor(serverProvider, expressServer, socketServer, buildCommandExecutor, manifestReader, sslReader, logger, analyticsService) {
        this._serverProvider = serverProvider;
        this._expressServer = expressServer;
        this._socketServer = socketServer;
        this._buildCommandExecutor = buildCommandExecutor;
        this._manifestReader = manifestReader;
        this._sslReader = sslReader;
        this._logger = logger;
        this._analyticsService = analyticsService;
    }
    /**
     * Run the Add-on server.
     *
     * @param options - {@link StartCommandOptions}.
     * @param expressApp - {@link Express}.
     * @returns Promise.
     */
    async execute(options, expressApp) {
        const isBuildSuccessful = await this._buildCommandExecutor.execute(options);
        if (isBuildSuccessful) {
            await this._start(options, expressApp);
        }
        else {
            this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR, LOGS.buildError, false);
        }
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
            this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR, LOGS.manifestValidationFailed, false);
        }
        console.log();
        process.exit(1);
    };
    async _start(options, expressApp) {
        const addOnManifest = (await this._manifestReader.getManifest(this._onValidationFailed));
        const addOnDirectory = new AddOnDirectory(options.srcDirectory, addOnManifest);
        const sslConfig = await this._sslReader.read(options.hostname);
        const server = await this._serverProvider(sslConfig);
        this._logger.information(format(LOGS.startingServer));
        if (options.verbose) {
            this._logger.message(format(LOGS.startingHttpServer));
        }
        this._expressServer.start(addOnDirectory, server, expressApp, options);
        if (options.verbose) {
            this._logger.message(format(LOGS.startingWebSocketServer));
        }
        await this._socketServer.start(addOnDirectory, server, options);
        this._displaySuccess(addOnDirectory);
        const analyticsEventData = [
            "--addOnName",
            addOnDirectory.rootDirName,
            "--testId",
            addOnManifest.manifestProperties.testId,
            "--manifestVersion",
            addOnManifest.manifestProperties.manifestVersion,
            "--use",
            options.transpiler,
            "--hostname",
            options.hostname,
            "--port",
            options.port
        ];
        this._analyticsService.postEvent(AnalyticsSuccessMarkers.SCRIPTS_START_COMMAND_SUCCESS, analyticsEventData.join(" "), true);
    }
    /**
     * Display success logs with the next steps.
     * @param addOnDirectory - {@link AddOnDirectory} Information about the Add-on.
     * @param options - {@link StartCommandOptions} Options used for the 'start' command.
     */
    _displaySuccess(addOnDirectory) {
        this._logger.warning(format(LOGS.sideloadAddOn, {
            appName: addOnDirectory.rootDirName
        }), { prefix: LOGS.newLine, postfix: LOGS.newLine });
    }
};
StartCommandExecutor = __decorate([
    injectable(),
    __param(0, inject(ITypes.SecureServer)),
    __param(1, inject(ITypes.ExpressServer)),
    __param(2, inject(ITypes.SocketServer)),
    __param(3, inject(ITypes.CommandExecutor)),
    __param(3, named("build")),
    __param(4, inject(ITypes.AddOnManifestReader)),
    __param(5, inject(ISSLTypes.SSLReader)),
    __param(6, inject(ICoreTypes.Logger)),
    __param(7, inject(IAnalyticsTypes.AnalyticsService)),
    __metadata("design:paramtypes", [Function, Object, Object, Object, Function, Object, Object, Object])
], StartCommandExecutor);
export { StartCommandExecutor };
const LOGS = {
    newLine: "\n",
    startingServer: "Starting Server ...",
    startingHttpServer: "Starting HTTPS Server ...",
    startingWebSocketServer: "Starting WSS Server ...",
    sideloadAddOn: "You can now sideload your add-on by enabling the Developer Mode in the Add-ons panel.",
    manifestValidationFailed: "Add-on manifest validation failed.",
    buildError: "Error while generating build."
};
//# sourceMappingURL=StartCommandExecutor.js.map