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
import { runCommand } from "@oclif/test";
import { assert } from "chai";
import type { Express } from "express";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import type { CommandExecutor } from "../../app/CommandExecutor.js";
import { IContainer, ITypes } from "../../config/index.js";
import { BuildCommandOptions } from "../../models/BuildCommandOptions.js";
import { PackageCommandOptions } from "../../models/PackageCommandOptions.js";
import { StartCommandOptions } from "../../models/StartCommandOptions.js";
import type { CommandValidator } from "../../validators/CommandValidator.js";

describe("ccweb-add-on-scripts", () => {
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

        namedContainer.withArgs(ITypes.CommandExecutor, "clean").returns(commandExecutor);
        namedContainer.withArgs(ITypes.CommandExecutor, "build").returns(commandExecutor);
        namedContainer.withArgs(ITypes.CommandExecutor, "start").returns(commandExecutor);
        namedContainer.withArgs(ITypes.CommandExecutor, "package").returns(commandExecutor);

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

    describe("clean", () => {
        it("should execute succesfully when no parameters are passed.", async () => {
            await runCommand("clean", { root: "." });
            assert.equal(commandExecutor.execute.callCount, 1);
        });

        it("should execute succesfully parameters are passed.", async () => {
            await runCommand(["clean", "--analytics=off"], { root: "." });
            assert.equal(commandExecutor.execute.callCount, 1);
        });

        it("should fail for any errors in command execution.", async () => {
            const error = new Error("Something went wrong.");
            commandExecutor.execute.rejects(error);

            await runCommand("clean", { root: "." }).then(result => assert.deepEqual(result.error, error));

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

    describe("build", () => {
        it("should execute succesfully when no parameters are passed.", async () => {
            await runCommand("build", { root: "." });

            const options = new BuildCommandOptions(DEFAULT_SRC_DIRECTORY, "", false);
            assert.equal(commandExecutor.execute.calledWith(options), true);
        });

        it("should execute succesfully when parameters are passed.", async () => {
            await runCommand(["build", "--use=tsc", "-v"], { root: "." });

            const options = new BuildCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", true);
            assert.equal(commandExecutor.execute.calledWith(options), true);
        });

        it("should fail for any errors in command execution.", async () => {
            const error = new Error("Something went wrong.");
            commandExecutor.execute.rejects(error);

            await runCommand("build", { root: "." }).then(result => assert.deepEqual(result.error, error));

            assert.equal(
                analyticsService.postEvent.calledOnceWith(
                    AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                    error.message,
                    false
                ),
                true
            );
        });
    });

    describe("start", () => {
        it("should execute succesfully when no parameters are passed.", async () => {
            await runCommand("start", { root: "." });

            const options = new StartCommandOptions(
                DEFAULT_SRC_DIRECTORY,
                "",
                DEFAULT_HOST_NAME,
                parseInt(DEFAULT_PORT),
                false
            );
            assert.equal(commandExecutor.execute.calledWith(options, expressApp), true);
        });

        it("should execute succesfully when parameters are passed.", async () => {
            await runCommand(["start", "--use=tsc", "-v", "--port=8000"], { root: "." });

            const options = new StartCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", DEFAULT_HOST_NAME, 8000, true);
            assert.equal(commandExecutor.execute.calledWith(options, expressApp), true);
        });

        it("should fail for any errors in command execution.", async () => {
            const error = new Error("Something went wrong.");
            commandExecutor.execute.rejects(error);

            await runCommand("start", { root: "." }).then(result => assert.deepEqual(result.error, error));

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

    describe("package", () => {
        it("should execute succesfully when no parameters are passed.", async () => {
            await runCommand("package", { root: "." });

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "", true, false);
            assert.equal(commandExecutor.execute.calledWith(options), true);
        });

        it("should execute succesfully when parameters are passed.", async () => {
            await runCommand(["package", "--use=tsc", "-v"], { root: "." });

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", true, true);
            assert.equal(commandExecutor.execute.calledWith(options), true);
        });

        it("should fail for any errors in command execution.", async () => {
            const error = new Error("Something went wrong.");
            commandExecutor.execute.rejects(error);

            await runCommand("package", { root: "." }).then(result => assert.deepEqual(result.error, error));

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
