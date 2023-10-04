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
import { DEFAULT_SRC_DIRECTORY } from "@adobe/ccweb-add-on-core";
import { Config } from "@oclif/core";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import type { CommandExecutor } from "../../app/CommandExecutor.js";
import { Package } from "../../commands/package.js";
import { IContainer, ITypes } from "../../config/index.js";
import { PackageCommandOptions } from "../../models/PackageCommandOptions.js";

chai.use(chaiAsPromised);

describe("package", () => {
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
        namedContainer.withArgs(ITypes.CommandExecutor, "package").returns(commandExecutor);

        analyticsConsent = stubInterface();
        analyticsService = stubInterface();

        container = sandbox.stub(IContainer, "get");
        container.withArgs(IAnalyticsTypes.AnalyticsConsent).returns(analyticsConsent);
        container.withArgs(IAnalyticsTypes.AnalyticsService).returns(analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("run", () => {
        it("should execute succesfully when no parameters are passed.", async () => {
            analyticsConsent.get.resolves(true);

            const packageCommand = new Package([], new Config({ root: "." }));

            await packageCommand.run();

            assert.equal(analyticsConsent.get.callCount, 1);

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "", true, false);
            assert.isTrue(commandExecutor.execute.calledWith(options));
        });

        it("should execute succesfully when parameters are passed.", async () => {
            analyticsConsent.get.resolves(true);
            analyticsConsent.set.withArgs(true).resolves();

            const packageCommand = new Package(
                ["--src", DEFAULT_SRC_DIRECTORY, "--use", "tsc", "--no-rebuild", "--analytics", "off", "--verbose"],
                new Config({ root: "." })
            );

            await packageCommand.run();

            assert.equal(analyticsConsent.set.calledOnceWith(false), true);

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", false, true);
            assert.isTrue(commandExecutor.execute.calledWith(options));
        });
    });

    describe("catch", () => {
        it("should fail when incorrect params are passed", async () => {
            const setup = new Package(["--incorrect-flag"], new Config({ root: "." }));

            const error = new Error("Nonexistent flag: --incorrect-flag\nSee more help with --help");

            await expect(setup.catch(error)).to.be.rejectedWith();

            assert.equal(
                analyticsService.postEvent.calledOnceWith(
                    AnalyticsErrorMarkers.SCRIPTS_PACKAGE_COMMAND_ERROR,
                    error.message,
                    false
                ),
                true
            );
        });
    });
});
