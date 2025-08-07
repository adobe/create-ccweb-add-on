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

import type { Logger, Process } from "@adobe/ccweb-add-on-core";
import { DEFAULT_HOST_NAME, PackageJson, TemplateJson } from "@adobe/ccweb-add-on-core";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import type { CommandExecutor as SSLCommandExecutor } from "@adobe/ccweb-add-on-ssl";
import { SetupCommandOptions as SSLSetupCommandOptions } from "@adobe/ccweb-add-on-ssl";
import { assert } from "chai";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { fileURLToPath } from "url";
import type { AddOnBuilderFactory } from "../../app/AddOnBuilder.js";
import type { AddOnBuilder } from "../../app/AddOnBuilder.js";
import { AddOnScaffolder } from "../../app/AddOnScaffolder.js";
import type { PackageBuilderFactory } from "../../app/PackageBuilder.js";
import type { PackageBuilder } from "../../app/PackageBuilder.js";
import { ScaffolderOptions } from "../../models/ScaffolderOptions.js";
import type { TemplateValidator } from "../../validators/TemplateValidator.js";

describe("AddOnScaffolder", () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    describe("run", () => {
        let sandbox: SinonSandbox;

        let templateValidator: StubbedInstance<TemplateValidator>;

        let packageBuilder: StubbedInstance<PackageBuilder>;
        let packageBuilderFactory: PackageBuilderFactory;

        let addOnBuilder: StubbedInstance<AddOnBuilder>;
        let addOnBuilderFactory: AddOnBuilderFactory;

        let sslCommandExecutor: StubbedInstance<SSLCommandExecutor<SSLSetupCommandOptions>>;

        let cliProcess: StubbedInstance<Process>;
        let logger: StubbedInstance<Logger>;

        let addOnScaffolder: AddOnScaffolder;

        beforeEach(() => {
            sandbox = sinon.createSandbox();

            templateValidator = stubInterface();

            packageBuilder = stubInterface();
            packageBuilderFactory = sandbox.stub().returns(sandbox.stub().returns(packageBuilder));

            addOnBuilder = stubInterface();
            addOnBuilderFactory = sandbox.stub().returns(addOnBuilder);

            sslCommandExecutor = stubInterface();

            cliProcess = stubInterface();
            logger = stubInterface();

            addOnScaffolder = new AddOnScaffolder(
                addOnBuilderFactory,
                packageBuilderFactory,
                templateValidator,
                sslCommandExecutor,
                cliProcess,
                logger
            );
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("should handle any error and exit.", async () => {
            const error = new Error("Unexpected error.");
            templateValidator.validateTemplate.throws(error);

            const processExitStub = sandbox.stub(process, "exit");

            const addOnDirectory = `${__dirname}/data/first-test-app`;
            const addOnName = "first-test-app";
            const entrypointType = EntrypointType.PANEL;
            const rootDirectory = `${__dirname}/data`;
            const templateName = "javascript";
            const verbose = false;

            const options = new ScaffolderOptions(
                addOnDirectory,
                addOnName,
                entrypointType,
                rootDirectory,
                templateName,
                verbose
            );

            await addOnScaffolder.run(options);

            assert.equal(cliProcess.handleError.callCount, 1);
            assert.equal(cliProcess.handleError.calledWithMatch(error), true);

            sinon.assert.calledWith(processExitStub, 1);
        });

        const runs = [
            {
                addOnDirectory: `${__dirname}/data/first-test-app`,
                addOnName: "first-test-app",
                entrypointType: EntrypointType.PANEL,
                rootDirectory: `${__dirname}/data`,
                templateName: "javascript",
                verbose: true
            },
            {
                addOnDirectory: `${__dirname}/data/second-test-app`,
                addOnName: "second-test-app",
                entrypointType: EntrypointType.PANEL,
                rootDirectory: `${__dirname}/data`,
                templateName: "javascript",
                verbose: false
            }
        ];
        runs.forEach(run => {
            it("should scaffold an Add-on and install template devDependencies and dependencies when there are no errors.", async () => {
                templateValidator.validateTemplate.returns();

                const packageJson = new PackageJson({
                    name: run.addOnName,
                    version: "1.0.0",
                    description: `WXP ${run.entrypointType} application.`,
                    keywords: ["adobe", "wxp", run.entrypointType],
                    scripts: {
                        clean: "ccweb-add-on-scripts clean",
                        build: "ccweb-add-on-scripts build",
                        start: "ccweb-add-on-scripts start"
                    },
                    devDependencies: {
                        a: "1.0.0"
                    },
                    dependencies: {
                        x: "3.0.0"
                    }
                });
                addOnBuilder.getTemplateJson.returns(packageJson);

                const templateJson = new TemplateJson({
                    devDependencies: {
                        b: "2.0.0"
                    },
                    dependencies: {
                        y: "4.0.0",
                        z: "5.0.0"
                    }
                });
                addOnBuilder.getTemplateJson.returns(templateJson);

                const combinedPackageJson = new PackageJson({
                    name: run.addOnName,
                    version: "1.0.0",
                    description: `WXP ${run.entrypointType} application.`,
                    keywords: ["adobe", "wxp", run.entrypointType],
                    scripts: {
                        clean: "ccweb-add-on-scripts clean",
                        build: "ccweb-add-on-scripts build",
                        start: "ccweb-add-on-scripts start"
                    },
                    devDependencies: {
                        a: "1.0.0",
                        b: "2.0.0"
                    },
                    dependencies: {
                        x: "3.0.0",
                        y: "4.0.0",
                        z: "5.0.0"
                    }
                });
                packageBuilder.build.returns(combinedPackageJson);

                addOnBuilder.build.withArgs(combinedPackageJson.toJSON()).returns();

                const devDependencies = new Set(["b@2.0.0"]);
                addOnBuilder.getDevDependenciesToInstall.withArgs(templateJson).returns(devDependencies);

                const expectedDevDependenciesArgs = ["install", "--save-dev", "--save-exact", ...devDependencies];
                if (run.verbose) {
                    expectedDevDependenciesArgs.push("--verbose");
                }

                const installDevDependenciesResult = {
                    isSuccessful: true,
                    command: `npm ${expectedDevDependenciesArgs.join(" ")}`
                };
                cliProcess.execute
                    .withArgs("npm", expectedDevDependenciesArgs, { stdio: "inherit" })
                    .returns(Promise.resolve(installDevDependenciesResult));

                const dependencies = new Set(["y@4.0.0", "z@5.0.0"]);
                addOnBuilder.getDependenciesToInstall.withArgs(templateJson).returns(dependencies);

                const expectedDependenciesArgs = ["install", "--save-exact", ...dependencies];
                if (run.verbose) {
                    expectedDependenciesArgs.push("--verbose");
                }

                const installDependenciesResult = {
                    isSuccessful: true,
                    command: `npm ${expectedDependenciesArgs.join(" ")}`
                };
                cliProcess.execute
                    .withArgs("npm", expectedDependenciesArgs, { stdio: "inherit" })
                    .returns(Promise.resolve(installDependenciesResult));

                const setupCommandOptions = new SSLSetupCommandOptions(DEFAULT_HOST_NAME, true, run.verbose);
                sslCommandExecutor.execute.withArgs(setupCommandOptions).resolves();

                addOnBuilder.displaySuccess.returns();

                const options = new ScaffolderOptions(
                    run.addOnDirectory,
                    run.addOnName,
                    run.entrypointType as EntrypointType,
                    run.rootDirectory,
                    run.templateName,
                    run.verbose
                );

                await addOnScaffolder.run(options);

                assert.equal(logger.information.callCount, 2);
                assert.equal(
                    logger.information.getCall(0).calledWith("Installing template dev dependencies ...", {
                        prefix: "\n"
                    }),
                    true
                );
                assert.equal(
                    logger.information.getCall(1).calledWith("Installing template dependencies ...", {
                        prefix: "\n"
                    }),
                    true
                );

                assert.equal(sslCommandExecutor.execute.calledOnceWith(setupCommandOptions), true);
            });
        });
    });
});
