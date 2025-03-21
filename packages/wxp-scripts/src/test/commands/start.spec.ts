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

import type { AnalyticsConsent, AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import { DEFAULT_HOST_NAME, DEFAULT_PORT, DEFAULT_SRC_DIRECTORY } from "@adobe/ccweb-add-on-core";
import { Config } from "@oclif/core";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type { Express } from "express";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import type { CommandExecutor } from "../../app/CommandExecutor.js";
import { Start } from "../../commands/start.js";
import { IContainer, ITypes } from "../../config/index.js";
import { PROGRAM_NAME } from "../../constants.js";
import { StartCommandOptions } from "../../models/StartCommandOptions.js";
import type { CommandValidator } from "../../validators/CommandValidator.js";

chai.use(chaiAsPromised);

describe("start", () => {
    let sandbox: sinon.SinonSandbox;

    let container: sinon.SinonStub;
    let namedContainer: sinon.SinonStub;

    let expressApp: StubbedInstance<Express>;

    let commandExecutor: StubbedInstance<CommandExecutor>;
    let commandValidator: StubbedInstance<CommandValidator>;

    let analyticsConsent: StubbedInstance<AnalyticsConsent>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        commandValidator = stubInterface();
        commandValidator.validate.resolves();

        commandExecutor = stubInterface();
        commandExecutor.execute.resolves();

        namedContainer = sandbox.stub(IContainer, "getNamed");

        namedContainer.withArgs(ITypes.CommandValidator, "start").returns(commandValidator);
        namedContainer.withArgs(ITypes.CommandExecutor, "start").returns(commandExecutor);

        expressApp = stubInterface();

        analyticsConsent = stubInterface();
        analyticsService = stubInterface();

        container = sandbox.stub(IContainer, "get");

        container.withArgs(ITypes.ExpressApp).returns(expressApp);

        container.withArgs(IAnalyticsTypes.AnalyticsConsent).returns(analyticsConsent);
        container.withArgs(IAnalyticsTypes.AnalyticsService).returns(analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("run", async () => {
        it("should execute succesfully when no parameters are passed.", async () => {
            analyticsConsent.get.resolves(true);

            const start = new Start([], new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." }));
            sandbox
                // @ts-ignore - Sidestep `this.parse()` error when calling `run()` directly.
                .stub(start, "parse")
                .resolves({
                    flags: {
                        src: DEFAULT_SRC_DIRECTORY,
                        use: "",
                        hostname: DEFAULT_HOST_NAME,
                        port: DEFAULT_PORT,
                        analytics: undefined,
                        verbose: false
                    }
                });

            await start.run();

            const options = new StartCommandOptions(
                DEFAULT_SRC_DIRECTORY,
                "",
                DEFAULT_HOST_NAME,
                parseInt(DEFAULT_PORT),
                false
            );

            assert.equal(analyticsConsent.get.callCount, 1);

            assert.equal(commandExecutor.execute.calledWith(options, expressApp), true);
        });

        it("should execute succesfully when parameters are passed.", async () => {
            const start = new Start(
                ["--src", DEFAULT_SRC_DIRECTORY, "--use", "tsc", "--port", "8000", "--analytics", "off", "--verbose"],
                new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." })
            );
            sandbox
                // @ts-ignore - Sidestep `this.parse()` error when calling `run()` directly.
                .stub(start, "parse")
                .resolves({
                    flags: {
                        src: DEFAULT_SRC_DIRECTORY,
                        use: "tsc",
                        hostname: DEFAULT_HOST_NAME,
                        port: "8000",
                        analytics: "off",
                        verbose: true
                    }
                });

            await start.run();

            assert.equal(analyticsConsent.set.calledOnceWith(false), true);

            const options = new StartCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", DEFAULT_HOST_NAME, 8000, true);
            assert.equal(commandExecutor.execute.calledWith(options, expressApp), true);
        });
    });

    describe("catch", () => {
        it("should fail for any errors in command execution.", async () => {
            const build = new Start([], new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." }));

            const error = new Error("Something went wrong.");
            await expect(build.catch(error)).to.be.rejectedWith(error);

            assert.equal(
                analyticsService.postEvent.calledOnceWith(
                    AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR,
                    error.message,
                    false
                ),
                true
            );
        });
    });
});
