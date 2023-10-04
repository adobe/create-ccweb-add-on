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
/// <reference types="node" />
import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import type { Logger } from "@adobe/ccweb-add-on-core";
import type { SSLData, SSLReader } from "@adobe/ccweb-add-on-ssl";
import type { Express } from "express";
import type { Server } from "https";
import "reflect-metadata";
import type { StartCommandOptions } from "../models/StartCommandOptions.js";
import type { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import type { CommandExecutor } from "./CommandExecutor.js";
import type { ExpressServer, SocketServer } from "./index.js";
/**
 * Server provider.
 */
export declare type ServerProvider = (sslConfig: SSLData) => Promise<Server>;
/**
 * Start command executor.
 */
export declare class StartCommandExecutor implements CommandExecutor {
    private readonly _serverProvider;
    private readonly _expressServer;
    private readonly _socketServer;
    private readonly _buildCommandExecutor;
    private readonly _manifestReader;
    private readonly _sslReader;
    private readonly _logger;
    private readonly _analyticsService;
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
    constructor(serverProvider: ServerProvider, expressServer: ExpressServer, socketServer: SocketServer, buildCommandExecutor: CommandExecutor, manifestReader: AddOnManifestReader, sslReader: SSLReader, logger: Logger, analyticsService: AnalyticsService);
    /**
     * Run the Add-on server.
     *
     * @param options - {@link StartCommandOptions}.
     * @param expressApp - {@link Express}.
     * @returns Promise.
     */
    execute(options: StartCommandOptions, expressApp: Express): Promise<void>;
    private _onValidationFailed;
    private _start;
    /**
     * Display success logs with the next steps.
     * @param addOnDirectory - {@link AddOnDirectory} Information about the Add-on.
     * @param options - {@link StartCommandOptions} Options used for the 'start' command.
     */
    private _displaySuccess;
}
//# sourceMappingURL=StartCommandExecutor.d.ts.map