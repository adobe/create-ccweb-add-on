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
import type { Server } from "https";
import "reflect-metadata";
import type { AddOnDirectory, StartCommandOptions } from "../models/index.js";
import type { AddOnManifestReader, EntityTracker } from "../utilities/index.js";
import type { ScriptManager, SocketAppFactory, SocketServer } from "./index.js";
/**
 * WebSocket server implementation class to handle messaging on the Add-On server.
 */
export declare class WxpSocketServer implements SocketServer {
    private readonly _socketAppFactory;
    private readonly _entityTracker;
    private readonly _scriptManager;
    private readonly _manifestReader;
    private readonly _logger;
    private readonly _analyticsService;
    private _watcher?;
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
    constructor(socketAppFactory: SocketAppFactory, entityTracker: EntityTracker, scriptManager: ScriptManager, manifestReader: AddOnManifestReader, logger: Logger, analyticsService: AnalyticsService);
    /**
     * Start the WebSocket server.
     *
     * @param addOnDirectory - {@link AddOnDirectory} Add-on directory information on which the script is executed.
     * @param server - {@link Server} Sever where the Add-on is hosted.
     * @param options - {@link StartCommandOptions} Options which the Add-on is started with.
     */
    start(addOnDirectory: AddOnDirectory, server: Server, options: StartCommandOptions): Promise<void>;
    private _watchForChanges;
    private _onValidationFailed;
    private _getMessage;
}
//# sourceMappingURL=WxpSocketServer.d.ts.map