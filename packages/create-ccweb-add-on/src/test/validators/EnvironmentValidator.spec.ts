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

import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import type { Logger, Process } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import "mocha";
import process from "process";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import { PROGRAM_NAME } from "../../constants.js";
import { EnvironmentValidator } from "../../validators/EnvironmentValidator.js";

describe("EnvironmentValidator", () => {
    let sandbox: SinonSandbox;

    let cliProcess: StubbedInstance<Process>;
    let analyticsService: StubbedInstance<AnalyticsService>;
    let logger: StubbedInstance<Logger>;

    let validator: EnvironmentValidator;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        cliProcess = stubInterface();

        analyticsService = stubInterface();
        analyticsService.postEvent.resolves();

        logger = stubInterface();

        validator = new EnvironmentValidator(cliProcess, logger, analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("validateNodeVersion", () => {
        const runs = [{ version: "10.0.0" }, { version: "17.9.9" }];
        runs.forEach(({ version }) => {
            it(`should exit for lower node version: ${version}.`, async () => {
                const validator: EnvironmentValidator = new EnvironmentValidator(cliProcess, logger, analyticsService);
                const processExitStub = sandbox.stub(process, "exit");

                cliProcess.executeSync
                    .withArgs("node", ["--version"])
                    .returns({ command: "node --version", isSuccessful: true, data: version });

                await validator.validateNodeVersion();

                assert.equal(logger.warning.callCount, 1);
                assert.equal(logger.warning.calledWith(`You are using node ${version}.`), true);

                assert.equal(logger.information.callCount, 2);
                assert.equal(
                    logger.information.getCall(0).calledWith(`${PROGRAM_NAME} requires node 18.0.0 or higher.`),
                    true
                );
                assert.equal(logger.information.getCall(1).calledWith("Please update your version of node."), true);
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(
                        AnalyticsErrorMarkers.ERROR_INVALID_NODE,
                        `Invalid node version: ${version}`
                    ),
                    true
                );
                assert.equal(processExitStub.calledWith(0), true);
            });
        });

        it("should handle any error.", async () => {
            const expectedError = new Error("Unexpected error.");
            cliProcess.executeSync.withArgs("node", ["--version"]).throws(expectedError);

            await validator.validateNodeVersion();

            assert.equal(cliProcess.handleError.callCount, 1);
            assert.equal(cliProcess.handleError.calledWith(expectedError), true);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });
    });

    describe("validateNpmVersion", () => {
        const dataList = [{ data: undefined }, { data: "" }];
        dataList.forEach(({ data }) => {
            it("should exit for no npm version.", async () => {
                const validator: EnvironmentValidator = new EnvironmentValidator(cliProcess, logger, analyticsService);
                const processExitStub = sandbox.stub(process, "exit");

                cliProcess.executeSync
                    .withArgs("npm", ["--version"])
                    .returns({ command: "npm --version", isSuccessful: true, data });

                await validator.validateNpmVersion();

                assert.equal(logger.warning.callCount, 1);
                assert.equal(logger.warning.calledWith("You are not using npm."), true);

                assert.equal(logger.information.callCount, 2);
                assert.equal(
                    logger.information.getCall(0).calledWith(`${PROGRAM_NAME} requires npm 10.0.0 or higher.`),
                    true
                );
                assert.equal(logger.information.getCall(1).calledWith("Please install npm."), true);
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(AnalyticsErrorMarkers.ERROR_NO_NPM, "npm is not present"),
                    true
                );
                assert.equal(processExitStub.calledWith(0), true);
            });
        });

        const runs = [{ version: "3.0.0" }, { version: "9.9.9" }];
        runs.forEach(run => {
            it(`should exit for lower npm version: ${run.version}.`, async () => {
                const validator: EnvironmentValidator = new EnvironmentValidator(cliProcess, logger, analyticsService);
                const processExitStub = sandbox.stub(process, "exit");

                cliProcess.executeSync
                    .withArgs("npm", ["--version"])
                    .returns({ command: "npm --version", isSuccessful: true, data: run.version });

                await validator.validateNpmVersion();

                assert.equal(logger.warning.callCount, 1);
                assert.equal(logger.warning.calledWith(`You are using npm ${run.version}.`), true);

                assert.equal(logger.information.callCount, 2);
                assert.equal(
                    logger.information.getCall(0).calledWith(`${PROGRAM_NAME} requires npm 10.0.0 or higher.`),
                    true
                );
                assert.equal(logger.information.getCall(1).calledWith("Please update your version of npm."), true);
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(
                        AnalyticsErrorMarkers.ERROR_INVALID_NPM,
                        `Invalid npm version: ${run.version}`
                    ),
                    true
                );
                assert.equal(processExitStub.calledWith(0), true);
            });
        });

        it("should handle any error.", async () => {
            const expectedError = new Error("Unexpected error.");
            cliProcess.executeSync.withArgs("npm", ["--version"]).throws(expectedError);

            await validator.validateNpmVersion();

            assert.equal(cliProcess.handleError.callCount, 1);
            assert.equal(cliProcess.handleError.calledWith(expectedError), true);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });
    });

    describe("validateNpmConfiguration", () => {
        it("should return for empty config list.", async () => {
            const processExitStub = sandbox.stub(process, "exit");
            cliProcess.executeSync
                .withArgs("npm", ["config", "list"])
                .returns({ command: "npm config list", isSuccessful: true });

            await validator.validateNpmConfiguration();

            assert.equal(analyticsService.postEvent.callCount, 0);
            assert.equal(processExitStub.callCount, 0);
        });

        it("should return for missing cwd entry in config list.", async () => {
            const processExitStub = sandbox.stub(process, "exit");
            cliProcess.executeSync.withArgs("npm", ["config", "list"]).returns({
                command: "npm config list",
                isSuccessful: true,
                data: `; HOME = /Users/random`
            });

            await validator.validateNpmConfiguration();

            assert.equal(analyticsService.postEvent.callCount, 0);
            assert.equal(processExitStub.callCount, 0);
        });

        it("should return for matching cwd entry in config list to actual cwd.", async () => {
            const processExitStub = sandbox.stub(process, "exit");
            cliProcess.executeSync.withArgs("npm", ["config", "list"]).returns({
                command: "npm config list",
                isSuccessful: true,
                data: `; cwd = ${process.cwd()}`
            });

            await validator.validateNpmConfiguration();

            assert.equal(analyticsService.postEvent.callCount, 0);
            assert.equal(processExitStub.callCount, 0);
        });

        it("should return for any errors.", async () => {
            const processExitStub = sandbox.stub(process, "exit");
            cliProcess.executeSync.throws(new Error("Unexpected error."));

            await validator.validateNpmConfiguration();

            assert.equal(analyticsService.postEvent.callCount, 0);
            assert.equal(processExitStub.callCount, 0);
        });

        it("should exit for mismatching cwd entry in config list to actual cwd.", async () => {
            const processExitStub = sandbox.stub(process, "exit");
            const npmCWD = "/random-directory";
            cliProcess.executeSync.withArgs("npm", ["config", "list"]).returns({
                command: "npm config list",
                isSuccessful: true,
                data: `; cwd = ${npmCWD}`
            });

            await validator.validateNpmConfiguration();

            assert.equal(logger.warning.callCount, 1);
            assert.equal(logger.warning.calledWith("Could not start an npm process in the right directory."), true);

            assert.equal(logger.information.callCount, 3);
            assert.equal(logger.information.getCall(0).calledWith(`The current directory is: ${process.cwd()}`), true);
            assert.equal(
                logger.information.getCall(1).calledWith(`However, a newly started npm process runs in: ${npmCWD}`),
                true
            );
            assert.equal(
                logger.information
                    .getCall(2)
                    .calledWith("This is probably caused by a misconfigured system terminal shell."),
                true
            );

            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.ERROR_NPM_NOT_STARTED,
                    "npm process could not be started"
                ),
                true
            );
            assert.equal(processExitStub.calledWith(0), true);
        });
    });
});
