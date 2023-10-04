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
import { DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes, getBaseUrl } from "@adobe/ccweb-add-on-core";
import type { Express } from "express";
import express from "express";
import type { Server } from "https";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import format from "string-template";
import { ITypes } from "../config/inversify.types.js";
import { HTTPS } from "../constants.js";
import type { AddOnDirectory, StartCommandOptions } from "../models/index.js";
import type { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import { AddOnResourceUtils } from "../utilities/AddOnResourceUtils.js";
import type { ExpressServer } from "./ExpressServer.js";

/**
 * HTTP server implementation class for handling HTTP requests on the Add-On server.
 */
@injectable()
export class WxpExpressServer implements ExpressServer {
    private readonly _manifestReader: AddOnManifestReader;
    private readonly _logger: Logger;

    /**
     * Instantiate {@link WxpExpressServer}.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link WxpExpressServer} instance.
     */
    constructor(
        @inject(ITypes.AddOnManifestReader) manifestReader: AddOnManifestReader,
        @inject(ICoreTypes.Logger) logger: Logger
    ) {
        this._manifestReader = manifestReader;
        this._logger = logger;
    }

    /**
     * Start the HTTP server.
     * @param addOnDirectory - {@link AddOnDirectory} Add-on directory information on which the script is executed.
     * @param server - {@link Server} Sever where the Add-on is hosted.
     * @param expressApp - {@link Express} Express app for serving HTTP requests.
     * @param options - {@link StartCommandOptions} Options which the Add-on is started with.
     */
    start(addOnDirectory: AddOnDirectory, server: Server, expressApp: Express, options: StartCommandOptions): void {
        expressApp.get(["/"], async (request, response) => {
            /* c8 ignore start */
            /* Unreachable code since this._expressApp.get is stubbed. */
            const manifest = await this._manifestReader.getManifest(() => {
                return;
            }, false);
            const baseUrl = getBaseUrl(HTTPS, request.headers.host ?? `${request.hostname}:${options.port}`);
            const addOns = AddOnResourceUtils.getAddOns(manifest!, addOnDirectory, baseUrl);
            response.set("Content-Type", "application/json");
            response.status(200).json({ addOns });
            /* c8 ignore stop */
        });

        expressApp.get(`/${addOnDirectory.manifest.manifestProperties.testId as string}`, async (request, response) => {
            /* c8 ignore start */
            /* Unreachable code since this._expressApp.get is stubbed. */
            const manifest = await this._manifestReader.getManifest(() => {
                return;
            }, false);
            let resources: string[] = [];
            try {
                const baseUrl = getBaseUrl(HTTPS, request.headers.host ?? `${request.hostname}:${options.port}`);
                resources = AddOnResourceUtils.getResources(manifest!, addOnDirectory.rootDirPath, baseUrl);
            } finally {
                response.set("Content-Type", "application/json");
                response.status(200).json({ resources });
            }
            /* c8 ignore stop */
        });

        expressApp.use(
            `/${addOnDirectory.manifest.manifestProperties.testId as string}`,
            express.static(DEFAULT_OUTPUT_DIRECTORY)
        );

        this._logger.success(
            format(LOGS.httpServerStarted, {
                addOnDirectory: addOnDirectory.rootDirName,
                serverUrl: getBaseUrl(HTTPS, `${options.hostname}:${options.port}`)
            })
        );

        server.listen(options.port, options.hostname);
    }
}

const LOGS = {
    newLine: "\n",
    httpServerStarted: "Done. Your add-on '{addOnDirectory}' is hosted on: {serverUrl}"
};
