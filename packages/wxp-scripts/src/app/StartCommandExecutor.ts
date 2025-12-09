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
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import type { Logger } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import type { ManifestError, ManifestValidationResult } from "@adobe/ccweb-add-on-manifest";
import type { SSLData, SSLReader } from "@adobe/ccweb-add-on-ssl";
import { ITypes as ISSLTypes } from "@adobe/ccweb-add-on-ssl";
import type { Express } from "express";
import type { Server } from "https";
import { inject, injectable, named } from "inversify";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import { AddOnDirectory } from "../models/AddOnDirectory.js";
import type { StartCommandOptions } from "../models/StartCommandOptions.js";
import type { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import type { BuildCommandExecutor } from "./BuildCommandExecutor.js";
import type { CommandExecutor } from "./CommandExecutor.js";
import type { ExpressServer } from "./ExpressServer.js";
import type { SocketServer } from "./SocketServer.js";

/**
 * Server provider.
 */
export type ServerProvider = (sslConfig: SSLData) => Promise<Server>;

/**
 * Start command executor.
 */
@injectable()
export class StartCommandExecutor implements CommandExecutor<StartCommandOptions> {
    private readonly _serverProvider: ServerProvider;
    private readonly _expressServer: ExpressServer;
    private readonly _socketServer: SocketServer;
    private readonly _buildCommandExecutor: BuildCommandExecutor;
    private readonly _manifestReader: AddOnManifestReader;
    private readonly _sslReader: SSLReader;
    private readonly _logger: Logger;
    private readonly _analyticsService: AnalyticsService;

    /**
     * Instantiate {@link StartCommandExecutor}.
     * @param serverProvider - {@link ServerProvider} reference.
     * @param expressServer - {@link ExpressServer} reference.
     * @param socketServer - {@link SocketServer} reference.
     * @param buildCommandExecutor - {@link BuildCommandExecutor} reference.
     * @param manifestReader - {@link AddOnManifestReader} reference.
     * @param sslReader - {@link SSLReader} reference.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link StartCommandExecutor} instance.
     */
    constructor(
        @inject(ITypes.SecureServer) serverProvider: ServerProvider,
        @inject(ITypes.ExpressServer) expressServer: ExpressServer,
        @inject(ITypes.SocketServer) socketServer: SocketServer,
        @inject(ITypes.CommandExecutor) @named("build") buildCommandExecutor: BuildCommandExecutor,
        @inject(ITypes.AddOnManifestReader) manifestReader: AddOnManifestReader,
        @inject(ISSLTypes.SSLReader) sslReader: SSLReader,
        @inject(ICoreTypes.Logger) logger: Logger,
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService
    ) {
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
    async execute(options: StartCommandOptions, expressApp: Express): Promise<void> {
        const isBuildSuccessful = await this._buildCommandExecutor.execute({
            srcDirectory: options.srcDirectory,
            transpiler: options.transpiler,
            verbose: options.verbose
        });
        if (isBuildSuccessful) {
            await this._start(options, expressApp);
        } else {
            void this._analyticsService.postEvent(
                AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR,
                LOGS.buildError,
                false
            );
        }
    }

    private _onValidationFailed = (failedResult: ManifestValidationResult) => {
        this._logger.error(LOGS.manifestValidationFailed);

        const { errorDetails } = failedResult;

        if (errorDetails !== undefined && errorDetails.length > 0) {
            errorDetails.forEach((manifestError?: ManifestError) => {
                if (!isNullOrWhiteSpace(manifestError?.message)) {
                    this._logger.error(
                        `${
                            !isNullOrWhiteSpace(manifestError?.instancePath) ? `${manifestError!.instancePath} - ` : ""
                        }${manifestError!.message}`
                    );
                }
            });
            void this._analyticsService.postEvent(
                AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR,
                LOGS.manifestValidationFailed,
                false
            );
        }

        console.log();
        process.exit(1);
    };

    private async _start(options: StartCommandOptions, expressApp: Express): Promise<void> {
        const addOnManifest = this._manifestReader.getManifest(this._onValidationFailed)!;
        const addOnDirectory = new AddOnDirectory(options.srcDirectory, addOnManifest);

        const sslConfig = await this._sslReader.read(options.hostname, options.port);
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
        void this._analyticsService.postEvent(
            AnalyticsSuccessMarkers.SCRIPTS_START_COMMAND_SUCCESS,
            analyticsEventData.join(" "),
            true
        );
    }

     /**
     * Display success logs with the next steps.
     * @param options - {@link StartCommandOptions} Options used for the 'start' command.
     */
     private _displaySuccess() {
        this._logger.success(LOGS.continueTestingAddOn, { prefix: LOGS.newLine });
    }
}

const LOGS = {
    newLine: "\n",
    startingServer: "Starting Server ...",
    startingHttpServer: "Starting HTTPS Server ...",
    startingWebSocketServer: "Starting WSS Server ...",
    continueTestingAddOn:
        "Continue testing your add-on in Adobe Express by accessing the link: https://www.adobe.com/go/addon-cli",
    manifestValidationFailed: "Add-on manifest validation failed.",
    buildError: "Error while generating build."
};
