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
import { Config } from "@oclif/core";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import type { CommandExecutor } from "../../app/CommandExecutor.js";
import { Clean } from "../../commands/clean.js";
import { IContainer, ITypes } from "../../config/index.js";
import { PROGRAM_NAME } from "../../constants.js";

chai.use(chaiAsPromised);

describe("clean", () => {
    let sandbox: sinon.SinonSandbox;

    let container: sinon.SinonStub;
    let namedContainer: sinon.SinonStub;

    let commandExecutor: StubbedInstance<CommandExecutor>;

    let analyticsConsent: StubbedInstance<AnalyticsConsent>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        commandExecutor = stubInterface();
        commandExecutor.execute.resolves();

        namedContainer = sandbox.stub(IContainer, "getNamed");
        namedContainer.withArgs(ITypes.CommandExecutor, "clean").returns(commandExecutor);

        analyticsConsent = stubInterface();
        analyticsService = stubInterface();

        container = sandbox.stub(IContainer, "get");
        container.withArgs(IAnalyticsTypes.AnalyticsConsent).returns(analyticsConsent);
        container.withArgs(IAnalyticsTypes.AnalyticsService).returns(analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("run", async () => {
        it("should execute succesfully when no parameters are passed.", async () => {
            analyticsConsent.get.resolves(true);

            const clean = new Clean([], new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." }));
            // @ts-ignore - Sidestep `this.parse()` error when calling `run()` directly.
            sandbox.stub(clean, "parse").resolves({ flags: { analytics: undefined } });

            await clean.run();

            assert.equal(analyticsConsent.get.callCount, 1);

            assert.equal(commandExecutor.execute.callCount, 1);
        });

        it("should execute succesfully when parameters are passed.", async () => {
            analyticsConsent.get.resolves(true);
            analyticsConsent.set.withArgs(true).resolves();

            const clean = new Clean(
                ["--analytics", "off"],
                new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." })
            );
            // @ts-ignore - Sidestep @oclif/test issue https://github.com/oclif/test/issues/720
            sandbox.stub(clean, "parse").resolves({ flags: { analytics: "off" } });

            await clean.run();

            assert.equal(analyticsConsent.set.calledOnceWith(false), true);

            assert.equal(commandExecutor.execute.callCount, 1);
        });
    });

    describe("catch", () => {
        it("should fail for any errors in command execution.", async () => {
            const clean = new Clean([], new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." }));

            const error = new Error("Something went wrong.");
            await expect(clean.catch(error)).to.be.rejectedWith(error);

            assert.equal(
                analyticsService.postEvent.calledOnceWith(
                    AnalyticsErrorMarkers.SCRIPTS_CLEAN_COMMAND_ERROR,
                    error.message,
                    false
                ),
                true
            );
        });
    });
});
