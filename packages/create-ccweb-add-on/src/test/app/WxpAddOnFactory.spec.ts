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
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import type { AddOnScaffolder } from "@adobe/ccweb-add-on-scaffolder";
import { ScaffolderOptions } from "@adobe/ccweb-add-on-scaffolder";
import { assert } from "chai";
import fs from "fs-extra";
import "mocha";
import path from "path";
import process from "process";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import url from "url";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../../AnalyticsMarkers.js";
import type { AddOnFactory, TemplateSelector } from "../../app/index.js";
import { WxpAddOnFactory } from "../../app/index.js";
import { CLIOptions } from "../../models/index.js";
import type { DirectoryValidator, EnvironmentValidator } from "../../validators/index.js";

describe("WxpAddOnFactory", () => {
    let sandbox: SinonSandbox;

    let directoryValidator: StubbedInstance<DirectoryValidator>;
    let environmentValidator: StubbedInstance<EnvironmentValidator>;
    let templateSelector: StubbedInstance<TemplateSelector>;

    let scaffolder: StubbedInstance<AddOnScaffolder>;

    let cliProcess: StubbedInstance<Process>;
    let logger: StubbedInstance<Logger>;

    let analyticsService: StubbedInstance<AnalyticsService>;

    let addOnFactory: AddOnFactory;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        directoryValidator = stubInterface();
        environmentValidator = stubInterface();
        templateSelector = stubInterface();

        scaffolder = stubInterface();

        cliProcess = stubInterface();

        logger = stubInterface();
        analyticsService = stubInterface();
        analyticsService.postEvent.resolves();

        addOnFactory = new WxpAddOnFactory(
            directoryValidator,
            environmentValidator,
            templateSelector,
            scaffolder,
            cliProcess,
            logger,
            analyticsService
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("create", () => {
        it(`should handle and remove created Add-on for any error.`, async () => {
            const error = new Error("Unexpected error.");
            environmentValidator.validateNodeVersion.throws(error);

            const processExitStub = sandbox.stub(process, "exit");

            const addOnKind = EntrypointType.PANEL;
            const addOnName = "test-add-on";
            const templateName = "javascript";
            const verbose = false;

            await addOnFactory.create(new CLIOptions(addOnKind, addOnName, templateName, verbose));

            assert.equal(cliProcess.handleError.callCount, 1);
            assert.equal(cliProcess.handleError.calledWith(error), true);

            assert.equal(cliProcess.removeAddOn.callCount, 1);
            assert.equal(cliProcess.removeAddOn.calledWith("", addOnName), true);
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(AnalyticsErrorMarkers.ERROR_UNKNOWN_REASON, "Unexpected error."),
                true
            );
            assert.equal(processExitStub.calledWith(0), true);
        });

        it("should handle the errors when template doesnt exist.", async () => {
            const run = {
                addOnKind: EntrypointType.PANEL,
                addOnName: "test-add-on",
                templateName: "javascript",
                verbose: false
            };
            const fsWriteFileStub = sandbox.stub(fs, "writeFileSync");
            fsWriteFileStub.returns();

            const processChangeDirStub = sandbox.stub(process, "chdir");
            processChangeDirStub.returns();

            sandbox.stub(path, "join").returns("true");

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.resolves();

            const ensureDirSyncStub = sandbox.stub(fs, "ensureDirSync");
            ensureDirSyncStub.resolves();

            const fileURLToPathStub = sandbox.stub(url, "fileURLToPath");
            fileURLToPathStub.resolves();

            const existsSyncStub = sandbox.stub(fs, "existsSync");
            existsSyncStub.returns(false);

            const copySyncStub = sandbox.stub(fs, "copySync");
            copySyncStub.resolves();

            templateSelector.setupTemplate.resolves(run.templateName);

            const options = new CLIOptions(
                run.addOnKind as EntrypointType,
                run.addOnName,
                run.templateName,
                run.verbose
            );

            await addOnFactory.create(options);
            assert.equal(logger.error.callCount, 1);
            assert.equal(processExitStub.calledWith(1), true);
        });

        const runs = [
            {
                addOnKind: EntrypointType.PANEL,
                addOnName: "test-add-on",
                templateName: "javascript",
                verbose: false
            },
            {
                addOnKind: EntrypointType.PANEL,
                addOnName: "test-add-on",
                templateName: "typescript",
                verbose: true
            },
            {
                addOnKind: EntrypointType.PANEL,
                addOnName: "test-add-on",
                templateName: "react-javascript",
                verbose: false
            }
        ];
        runs.forEach(run => {
            it("should create an Add-on when there are no errors.", async () => {
                const fsWriteFileStub = sandbox.stub(fs, "writeFileSync");
                fsWriteFileStub.returns();

                const processChangeDirStub = sandbox.stub(process, "chdir");
                processChangeDirStub.returns();

                sandbox.stub(path, "join").returns("true");
                const processExitStub = sandbox.stub(process, "exit");
                processExitStub.resolves();

                const ensureDirSyncStub = sandbox.stub(fs, "ensureDirSync");
                ensureDirSyncStub.resolves();

                const fileURLToPathStub = sandbox.stub(url, "fileURLToPath");
                fileURLToPathStub.resolves();

                const existsSyncStub = sandbox.stub(fs, "existsSync");
                existsSyncStub.resolves();

                const copySyncStub = sandbox.stub(fs, "copySync");
                copySyncStub.resolves();

                templateSelector.setupTemplate.resolves(run.templateName);

                const options = new CLIOptions(
                    run.addOnKind as EntrypointType,
                    run.addOnName,
                    run.templateName,
                    run.verbose
                );

                const npmInstallArgs = ["install", "--save-dev", "@adobe/ccweb-add-on-scripts"];

                if (run.templateName.includes("typescript")) {
                    npmInstallArgs.push("@adobe/ccweb-add-on-sdk-types");
                }

                if (run.verbose) {
                    npmInstallArgs.push("--verbose");
                }

                cliProcess.execute.withArgs("npm", npmInstallArgs, { stdio: "inherit" }).returns(
                    Promise.resolve({
                        command: `npm ${npmInstallArgs.join(" ")}`,
                        isSuccessful: true
                    })
                );

                const addOnDirectory = path.resolve(run.addOnName);
                const rootDirectory = process.cwd();
                const scaffolderOptions = new ScaffolderOptions(
                    addOnDirectory,
                    options.addOnName,
                    options.addOnKind,
                    rootDirectory,
                    run.templateName,
                    options.verbose
                );
                const analyticsServiceEventData = [
                    "--addOnName",
                    run.addOnName,
                    "--kind",
                    run.addOnKind,
                    "--template",
                    run.templateName
                ];

                scaffolder.run.withArgs(scaffolderOptions).resolves();

                await addOnFactory.create(options);

                assert.equal(environmentValidator.validateNodeVersion.callCount, 1);
                assert.equal(environmentValidator.validateNpmVersion.callCount, 1);
                assert.equal(environmentValidator.validateNpmConfiguration.callCount, 1);

                assert.equal(directoryValidator.validateAddOnName.callCount, 1);
                assert.equal(directoryValidator.validateAddOnDirectory.callCount, 1);

                assert.equal(templateSelector.setupTemplate.callCount, 1);

                assert.equal(fsWriteFileStub.callCount, 1);
                assert.equal(ensureDirSyncStub.callCount, 1);
                assert.equal(fileURLToPathStub.callCount, 1);
                assert.equal(existsSyncStub.callCount, 1);
                assert.equal(copySyncStub.callCount, 1);
                assert.equal(processChangeDirStub.callCount, 1);
                assert.equal(cliProcess.execute.callCount, 1);
                assert.equal(cliProcess.execute.calledWith("npm", npmInstallArgs, { stdio: "inherit" }), true);
                assert.equal(scaffolder.run.calledWith(scaffolderOptions), true);

                assert.equal(logger.information.callCount, 3);
                assert.equal(logger.information.getCall(0).calledWith("Creating a new Add-on ..."), true);
                assert.equal(
                    logger.information.getCall(1).calledWith("Installing dev dependencies ...", { prefix: "\n" }),
                    true
                );
                assert.equal(
                    logger.information
                        .getCall(2)
                        .calledWith(`Scaffolding project from template: ${run.templateName} ...`, {
                            prefix: "\n"
                        }),
                    true
                );

                assert.equal(logger.message.callCount, 1);
                assert.equal(logger.message.calledWith("This may take a minute ..."), true);
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(
                        AnalyticsSuccessMarkers.SUCCESS,
                        analyticsServiceEventData.join(" "),
                        true
                    ),
                    true
                );
            });
        });
    });
});
