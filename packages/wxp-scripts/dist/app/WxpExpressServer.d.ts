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
import type { Logger } from "@adobe/ccweb-add-on-core";
import type { Express } from "express";
import type { Server } from "https";
import "reflect-metadata";
import type { AddOnDirectory, StartCommandOptions } from "../models/index.js";
import type { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import type { ExpressServer } from "./ExpressServer.js";
/**
 * HTTP server implementation class for handling HTTP requests on the Add-On server.
 */
export declare class WxpExpressServer implements ExpressServer {
    private readonly _manifestReader;
    private readonly _logger;
    /**
     * Instantiate {@link WxpExpressServer}.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link WxpExpressServer} instance.
     */
    constructor(manifestReader: AddOnManifestReader, logger: Logger);
    /**
     * Start the HTTP server.
     * @param addOnDirectory - {@link AddOnDirectory} Add-on directory information on which the script is executed.
     * @param server - {@link Server} Sever where the Add-on is hosted.
     * @param expressApp - {@link Express} Express app for serving HTTP requests.
     * @param options - {@link StartCommandOptions} Options which the Add-on is started with.
     */
    start(addOnDirectory: AddOnDirectory, server: Server, expressApp: Express, options: StartCommandOptions): void;
}
//# sourceMappingURL=WxpExpressServer.d.ts.map