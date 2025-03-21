/********************************************************************************
 * MIT License

 * © Copyright 2025 Adobe. All rights reserved.

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
import { runCommand } from "@oclif/test";
import { assert } from "chai";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { PurgeCommandExecutor, SetupCommandExecutor } from "../../app/index.js";
import { IContainer, ITypes } from "../../config/index.js";
import { SetupCommandOptions } from "../../models/SetupCommandOptions.js";
import type { SetupCommandValidator } from "../../validators/SetupCommandValidator.js";

describe("ccweb-add-on-ssl", () => {
    let sandbox: sinon.SinonSandbox;

    let container: sinon.SinonStub;
    let namedContainer: sinon.SinonStub;

    let analyticsConsent: StubbedInstance<AnalyticsConsent>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        namedContainer = sandbox.stub(IContainer, "getNamed");

        analyticsConsent = stubInterface();
        analyticsService = stubInterface();

        container = sandbox.stub(IContainer, "get");
        container.withArgs(IAnalyticsTypes.AnalyticsConsent).returns(analyticsConsent);
        container.withArgs(IAnalyticsTypes.AnalyticsService).returns(analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("setup", () => {
        let commandExecutor: StubbedInstance<SetupCommandExecutor>;
        let commandValidator: StubbedInstance<SetupCommandValidator>;

        beforeEach(() => {
            commandExecutor = stubInterface();
            commandExecutor.execute.resolves();

            commandValidator = stubInterface();
            commandValidator.validate.resolves();

            namedContainer.withArgs(ITypes.CommandValidator, "setup").returns(commandValidator);
            namedContainer.withArgs(ITypes.CommandExecutor, "setup").returns(commandExecutor);
        });

        it("should execute succesfully when correct parameters are passed.", async () => {
            analyticsConsent.set.resolves();

            await runCommand(["setup", "--hostname=localhost", "--analytics=on", "--verbose"], { root: "." });

            const options = new SetupCommandOptions("localhost", false, true);
            assert.equal(commandValidator.validate.calledOnceWith(options), true);
            assert.equal(commandExecutor.execute.calledOnceWith(options), true);
        });
    });

    describe("purge", () => {
        let commandExecutor: StubbedInstance<PurgeCommandExecutor>;

        beforeEach(() => {
            commandExecutor = stubInterface();
            commandExecutor.execute.resolves();

            namedContainer.withArgs(ITypes.CommandExecutor, "purge").returns(commandExecutor);
        });

        it("should execute succesfully when correct parameters are passed.", async () => {
            analyticsConsent.set.resolves();

            await runCommand(["purge", "--analytics=on", "--verbose"], { root: "." });

            assert.equal(commandExecutor.execute.calledOnce, true);
        });
    });
});
