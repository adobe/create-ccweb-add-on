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
import { DEFAULT_HOST_NAME, getBaseUrl } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import type { Express } from "express";
import type { Server } from "https";
import "mocha";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { ExpressServer } from "../../app/index.js";
import { WxpExpressServer } from "../../app/index.js";
import { HTTPS } from "../../constants.js";
import { AddOnDirectory, StartCommandOptions } from "../../models/index.js";
import type { AddOnManifestReader } from "../../utilities/AddOnManifestReader.js";
import { createManifest } from "../test-utilities.js";

describe("WxpExpressServer", () => {
    let sandbox: SinonSandbox;

    let manifestReader: AddOnManifestReader;
    let logger: StubbedInstance<Logger>;
    let expressServer: ExpressServer;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        manifestReader = stubInterface<AddOnManifestReader>();
        logger = stubInterface<Logger>();
        expressServer = new WxpExpressServer(manifestReader, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("start ...", () => {
        it("should start HTTP server and expose APIs for the underlying resources.", async () => {
            const addOnDirectory = new AddOnDirectory("src", createManifest());
            const options = new StartCommandOptions("src", "", "localhost", 5241, true);

            const expressApp = stubInterface<Express>();
            expressApp.get.returns(expressApp);
            expressApp.use.returns(expressApp);

            const server = stubInterface<Server>();
            server.listen.returns(server);

            expressServer.start(addOnDirectory, server, expressApp, options);

            assert.equal(logger.success.callCount, 1);
            assert.equal(
                logger.success.calledWith(
                    `Done. Your add-on '${addOnDirectory.rootDirName}' is hosted on: ${getBaseUrl(
                        HTTPS,
                        `${DEFAULT_HOST_NAME}:${options.port}`
                    )}`
                ),
                true
            );
        });
    });
});
