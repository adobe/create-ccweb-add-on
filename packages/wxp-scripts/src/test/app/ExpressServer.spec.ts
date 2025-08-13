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

import type { AddOnListingData, Logger } from "@adobe/ccweb-add-on-core";
import { DEFAULT_HOST_NAME, getBaseUrl } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import type { Express } from "express";
import type { Server } from "https";
import "mocha";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { ExpressServer } from "../../app/ExpressServer.js";
import { HTTPS } from "../../constants.js";
import { AddOnDirectory } from "../../models/AddOnDirectory.js";
import { StartCommandOptions } from "../../models/StartCommandOptions.js";
import type { AddOnManifestReader } from "../../utilities/AddOnManifestReader.js";
import { AddOnResourceUtils } from "../../utilities/AddOnResourceUtils.js";
import { createManifest } from "../test-utilities.js";

describe("ExpressServer", () => {
    let sandbox: SinonSandbox;

    let manifestReader: AddOnManifestReader;
    let logger: StubbedInstance<Logger>;
    let expressServer: ExpressServer;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        manifestReader = stubInterface<AddOnManifestReader>();
        logger = stubInterface<Logger>();
        expressServer = new ExpressServer(manifestReader, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("start", () => {
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
                        DEFAULT_HOST_NAME,
                        options.port
                    )}`
                ),
                true
            );

            // also ensure server.listen is invoked with provided options
            const listenStub = server.listen as unknown as sinon.SinonStub;
            assert.equal(listenStub.called, true);
            const listenArgs = listenStub.getCall(0).args;
            assert.equal(listenArgs[0], options.port);
            assert.equal(listenArgs[1], options.hostname);

            // ensure routes and static middleware were registered
            assert.equal(expressApp.get.callCount >= 2, true);
            assert.equal(
                (expressApp.use as unknown as sinon.SinonStub).calledWith(
                    `/${addOnDirectory.manifest.manifestProperties.testId as string}`,
                    sinon.match.func
                ),
                true
            );
        });

        it("should handle GET '/' and return add-on listing data", () => {
            const addOnDirectory = new AddOnDirectory("src", createManifest());
            const options = new StartCommandOptions("src", "", "localhost", 5241, true);

            const expressApp = stubInterface<Express>();
            (expressApp.get as unknown as sinon.SinonStub).returns(expressApp);
            (expressApp.use as unknown as sinon.SinonStub).returns(expressApp);

            const server = stubInterface<Server>();
            (server.listen as unknown as sinon.SinonStub).returns(server);

            const manifest = createManifest();
            (manifestReader.getManifest as unknown as sinon.SinonStub).callsFake((cb?: () => void) => {
                if (typeof cb === "function") {
                    cb();
                }
                return manifest;
            });

            const fakeAddOns = [{ addonId: "test-app" }] as AddOnListingData[];
            sandbox.stub(AddOnResourceUtils, "getAddOnListingData").returns(fakeAddOns);

            expressServer.start(addOnDirectory, server, expressApp, options);

            const getStub = expressApp.get as unknown as sinon.SinonStub;
            // First GET registration is for ["/"]
            const args = getStub.getCall(0).args;
            assert.deepEqual(args[0], ["/"]);
            const handler = args[1] as (req: unknown, res: unknown) => void;

            const req = { headers: { host: `${options.hostname}:${options.port}` }, hostname: options.hostname };
            const res = {
                set: sandbox.stub().returnsThis(),
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };

            handler(req, res);

            assert.equal(res.set.calledWith("Content-Type", "application/json"), true);
            assert.equal(res.status.calledWith(200), true);
            assert.equal(res.json.calledWith({ addOns: fakeAddOns }), true);
        });

        it("should handle GET '/' and use hostname:port fallback when host header is missing", () => {
            const addOnDirectory = new AddOnDirectory("src", createManifest());
            const options = new StartCommandOptions("src", "", "localhost", 5241, true);

            const expressApp = stubInterface<Express>();
            (expressApp.get as unknown as sinon.SinonStub).returns(expressApp);
            (expressApp.use as unknown as sinon.SinonStub).returns(expressApp);

            const server = stubInterface<Server>();
            (server.listen as unknown as sinon.SinonStub).returns(server);

            const manifest = createManifest();
            (manifestReader.getManifest as unknown as sinon.SinonStub).callsFake(() => {
                return manifest;
            });

            const fakeAddOns = [{ addonId: "test-app" }] as AddOnListingData[];
            const resourceUtilsStub = sandbox.stub(AddOnResourceUtils, "getAddOnListingData").returns(fakeAddOns);

            expressServer.start(addOnDirectory, server, expressApp, options);

            const getStub = expressApp.get as unknown as sinon.SinonStub;
            // First GET registration is for ["/"]
            const args = getStub.getCall(0).args;
            const handler = args[1] as (req: unknown, res: unknown) => void;

            const req = { headers: {}, hostname: options.hostname };
            const res = {
                set: sandbox.stub().returnsThis(),
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };

            handler(req, res);

            // Verify fallback baseUrl was computed and passed to util
            const expectedBaseUrl = getBaseUrl(HTTPS, `${options.hostname}:${options.port}`);
            assert.equal(resourceUtilsStub.calledWith(sinon.match.any, sinon.match.any, expectedBaseUrl), true);

            assert.equal(res.set.calledWith("Content-Type", "application/json"), true);
            assert.equal(res.status.calledWith(200), true);
            assert.equal(res.json.calledWith({ addOns: fakeAddOns }), true);
        });

        it("should handle GET '/:testId' and return resources even when underlying call throws", () => {
            const addOnDirectory = new AddOnDirectory("src", createManifest());
            const options = new StartCommandOptions("src", "", "localhost", 5241, true);

            const expressApp = stubInterface<Express>();
            (expressApp.get as unknown as sinon.SinonStub).returns(expressApp);
            (expressApp.use as unknown as sinon.SinonStub).returns(expressApp);

            const server = stubInterface<Server>();
            (server.listen as unknown as sinon.SinonStub).returns(server);

            const manifest = createManifest();
            (manifestReader.getManifest as unknown as sinon.SinonStub).returns(manifest);

            sandbox.stub(AddOnResourceUtils, "getResources").throws(new Error("boom"));

            expressServer.start(addOnDirectory, server, expressApp, options);

            const getStub = expressApp.get as unknown as sinon.SinonStub;
            // Second GET is for `/${testId}`
            const args = getStub.getCall(1).args;
            assert.equal(args[0], `/${addOnDirectory.manifest.manifestProperties.testId as string}`);
            const handler = args[1] as (req: unknown, res: unknown) => void;

            // Ensure fallback when headers.host is undefined
            const req = { headers: {}, hostname: options.hostname };
            const res = {
                set: sandbox.stub().returnsThis(),
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };

            try {
                handler(req, res);
            } catch {
                // Swallow the error thrown by getResources to assert finally block behavior
            }

            assert.equal(res.set.calledWith("Content-Type", "application/json"), true);
            assert.equal(res.status.calledWith(200), true);
            // Resources should be empty array when utility throws and finally still sends response
            assert.equal(res.json.calledWith({ resources: [] }), true);
        });

        it("should handle GET '/:testId' and return resources when underlying call succeeds using host header", () => {
            const addOnDirectory = new AddOnDirectory("src", createManifest());
            const options = new StartCommandOptions("src", "", "localhost", 5241, true);

            const expressApp = stubInterface<Express>();
            (expressApp.get as unknown as sinon.SinonStub).returns(expressApp);
            (expressApp.use as unknown as sinon.SinonStub).returns(expressApp);

            const server = stubInterface<Server>();
            (server.listen as unknown as sinon.SinonStub).returns(server);

            const manifest = createManifest();
            (manifestReader.getManifest as unknown as sinon.SinonStub).returns(manifest);

            const fakeResources = ["https://example.com/a", "https://example.com/b"];
            sandbox.stub(AddOnResourceUtils, "getResources").returns(fakeResources);

            expressServer.start(addOnDirectory, server, expressApp, options);

            const getStub = expressApp.get as unknown as sinon.SinonStub;
            const args = getStub.getCall(1).args;
            const handler = args[1] as (req: unknown, res: unknown) => void;

            const req = { headers: { host: `${options.hostname}:${options.port}` }, hostname: options.hostname };
            const res = {
                set: sandbox.stub().returnsThis(),
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };

            handler(req, res);

            assert.equal(res.set.calledWith("Content-Type", "application/json"), true);
            assert.equal(res.status.calledWith(200), true);
            assert.equal(res.json.calledWith({ resources: fakeResources }), true);
        });
    });
});
