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
import type { Logger } from "@adobe/ccweb-add-on-core";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { assert, expect } from "chai";
import type { Stats } from "fs";
import type { Dirent } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import { PROGRAM_NAME } from "../../constants.js";
import { CLIOptions } from "../../models/CLIOptions.js";
import { DirectoryValidator } from "../../validators/DirectoryValidator.js";

describe("DirectoryValidator", () => {
    let sandbox: SinonSandbox;

    let analyticsService: StubbedInstance<AnalyticsService>;
    let logger: StubbedInstance<Logger>;

    let validator: DirectoryValidator;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        analyticsService = stubInterface<AnalyticsService>();
        logger = stubInterface<Logger>();

        validator = new DirectoryValidator(logger, analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("validateAddOnName", () => {
        let runs = [{ addOnName: "" }, { addOnName: " " }];
        runs.forEach(run => {
            it(`should exit for empty addOn name: ${run.addOnName}.`, async () => {
                const validator: DirectoryValidator = new DirectoryValidator(logger, analyticsService);
                const processExitStub = sandbox.stub(process, "exit");

                await validator.validateAddOnName(run.addOnName);
                analyticsService.postEvent.resolves();

                assert.equal(logger.warning.callCount, 2);
                assert.equal(logger.warning.getCall(0).calledWith("Please specify an Add-on name"), true);
                assert.equal(
                    logger.warning
                        .getCall(1)
                        .calledWith(`${PROGRAM_NAME} <add-on-name> --entrypoint <panel> --template <javascript>`, {
                            prefix: "  "
                        }),
                    true
                );

                assert.equal(logger.message.callCount, 1);
                assert.equal(
                    logger.message.calledWith("For example:", {
                        prefix: "\n"
                    }),
                    true
                );

                assert.equal(logger.information.callCount, 1);
                assert.equal(
                    logger.information.calledWith(
                        `${PROGRAM_NAME} my-add-on --entrypoint panel --template javascript`,
                        {
                            prefix: "  ",
                            postfix: "\n"
                        }
                    ),
                    true
                );
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(
                        AnalyticsErrorMarkers.ERROR_NO_ADD_ON_NAME,
                        "Add-on name was not specified"
                    ),
                    true
                );
                assert.equal(processExitStub.calledWith(0), true);
            });
        });

        runs = [{ addOnName: "_Foo_Bar" }, { addOnName: "$Foo$Bar" }];
        runs.forEach(run => {
            it(`should exit for npm restricted addOn name: ${run.addOnName}.`, async () => {
                const processExitStub = sandbox.stub(process, "exit");

                await validator.validateAddOnName(run.addOnName);
                analyticsService.postEvent.resolves();

                assert.equal(logger.warning.callCount, 2);
                assert.equal(
                    logger.warning
                        .getCall(0)
                        .calledWith(
                            `Cannot create a project named ${run.addOnName} because of NPM naming restrictions.`
                        ),
                    true
                );
                assert.equal(
                    logger.warning
                        .getCall(1)
                        .calledWith(`${PROGRAM_NAME} <add-on-name> --entrypoint <panel> --template <javascript>`, {
                            prefix: "  "
                        }),
                    true
                );

                assert.equal(logger.message.callCount, 1);
                assert.equal(
                    logger.message.calledWith("For example:", {
                        prefix: "\n"
                    }),
                    true
                );

                assert.equal(logger.information.callCount, 1);
                assert.equal(
                    logger.information.calledWith(
                        `${PROGRAM_NAME} my-add-on --entrypoint panel --template javascript`,
                        {
                            prefix: "  ",
                            postfix: "\n"
                        }
                    ),
                    true
                );
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(
                        AnalyticsErrorMarkers.ERROR_INVALID_NAME_NPM,
                        "Invalid Add-on name. Npm name check failed"
                    ),
                    true
                );
                assert.equal(processExitStub.calledWith(0), true);
            });
        });

        runs = [
            { addOnName: "@adobe/create-ccweb-add-on" },
            { addOnName: "create-ccweb-add-on" },
            { addOnName: "@adobe/ccweb-add-on-scripts" },
            { addOnName: "ccweb-add-on-scripts" },
            { addOnName: "@adobe/ccweb-add-on-scaffolder" },
            { addOnName: "ccweb-add-on-scaffolder" }
        ];
        runs.forEach(run => {
            it(`should exit for reserved addOn name: ${run.addOnName}.`, async () => {
                const processExitStub = sandbox.stub(process, "exit");

                await validator.validateAddOnName(run.addOnName);
                analyticsService.postEvent.resolves();

                assert.equal(logger.warning.callCount, 2);
                assert.equal(
                    logger.warning
                        .getCall(0)
                        .calledWith(
                            `Cannot create a project named ${run.addOnName} because a dependency with the same name exists.`
                        ),
                    true
                );
                assert.equal(
                    logger.warning
                        .getCall(1)
                        .calledWith(`${PROGRAM_NAME} <add-on-name> --entrypoint <panel> --template <javascript>`, {
                            prefix: "  "
                        }),
                    true
                );

                assert.equal(logger.message.callCount, 1);
                assert.equal(
                    logger.message.calledWith("For example:", {
                        prefix: "\n"
                    }),
                    true
                );

                assert.equal(logger.information.callCount, 1);
                assert.equal(
                    logger.information.calledWith(
                        `${PROGRAM_NAME} my-add-on --entrypoint panel --template javascript`,
                        {
                            prefix: "  ",
                            postfix: "\n"
                        }
                    ),
                    true
                );
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(
                        AnalyticsErrorMarkers.ERROR_INVALID_NAME_DEP,
                        "Invalid Add-on name. Dependency with same name exists"
                    ),
                    true
                );
                assert.equal(processExitStub.calledWith(0), true);
            });
        });

        it(`should validate correct Add-on name successfully.`, async () => {
            const processExitStub = sandbox.stub(process, "exit");

            analyticsService.postEvent.resolves();

            const validator: DirectoryValidator = new DirectoryValidator(logger, analyticsService);

            const cliOptions = new CLIOptions(EntrypointType.PANEL, "test-add-on", "javascript", false);
            await validator.validateAddOnName(cliOptions.addOnName);

            assert.equal(logger.warning.callCount, 0);
            assert.equal(processExitStub.callCount, 0);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });
    });

    describe("validateAddOnDirectory", () => {
        it("should throw error for non-existing Add-on directory.", async () => {
            const ensureDirStub = sandbox.stub(fs, "ensureDirSync");
            const error = new Error("Directory does not exist.");
            ensureDirStub.throws(error);
            analyticsService.postEvent.resolves();
            try {
                await validator.validateAddOnDirectory("/root-directory", "addOn-name");
            } catch (err) {
                expect(err.message).to.equal("Directory does not exist.");
            }
            assert.equal(analyticsService.postEvent.callCount, 0);
        });

        let runs = [
            {
                root: "/root",
                addOnName: "foo-bar",
                files: [{ name: "package.json" }],
                isDirectory: false
            },
            {
                root: "/root",
                addOnName: "foo-bar",
                files: [{ name: "foo-bar/" }],
                isDirectory: true
            }
        ];
        runs.forEach(run => {
            it("should exit for non-allowed files in root directory.", async () => {
                const processExitStub = sandbox.stub(process, "exit");

                const ensureDirStub = sandbox.stub(fs, "ensureDirSync");
                ensureDirStub.returns();

                const readDirStub = sandbox.stub(fs, "readdirSync");
                readDirStub.returns(run.files as Dirent[]);

                const lstatStub = sandbox.stub(fs, "lstatSync");
                const stats = <Stats>{
                    isDirectory: () => {
                        return run.isDirectory;
                    }
                };
                lstatStub.returns(stats);

                await validator.validateAddOnDirectory(run.root, run.addOnName);
                analyticsService.postEvent.resolves();

                assert.equal(logger.warning.callCount, 2);
                assert.equal(
                    logger.warning
                        .getCall(0)
                        .calledWith(`The directory ${run.addOnName} contains files that could conflict:`, {
                            postfix: "\n"
                        }),
                    true
                );

                if (run.isDirectory) {
                    assert.equal(logger.warning.getCall(1).calledWith(`${run.files[0].name}/`, { prefix: "  " }), true);
                } else {
                    assert.equal(logger.warning.getCall(1).calledWith(`${run.files[0].name}`, { prefix: "  " }), true);
                }

                assert.equal(logger.information.callCount, 1);
                assert.equal(
                    logger.information.calledWith(
                        "Either try using a new Add-on name, or remove the files listed above.",
                        { prefix: "\n" }
                    ),
                    true
                );

                assert.equal(processExitStub.callCount, 1);
                assert.equal(analyticsService.postEvent.callCount, 1);
                assert.equal(
                    analyticsService.postEvent.calledWith(
                        AnalyticsErrorMarkers.ERROR_INVALID_NAME_DIR,
                        "Invalid Add-on name. Conflicting directory with same name exists"
                    ),
                    true
                );
                assert.equal(processExitStub.calledWith(0), true);
            });
        });

        it("should exit for non-allowed files in root directory when error is thrown from lstatSync.", async () => {
            const run = {
                root: "/root",
                addOnName: "foo-bar",
                files: [{ name: "directory-removed-between-execution/" }]
            };

            const processExitStub = sandbox.stub(process, "exit");

            const ensureDirStub = sandbox.stub(fs, "ensureDirSync");
            ensureDirStub.returns();

            const readDirStub = sandbox.stub(fs, "readdirSync");
            readDirStub.returns(run.files as Dirent[]);

            const lstatStub = sandbox.stub(fs, "lstatSync");
            lstatStub.throws(new Error("ENOENT. File or directory does not exist."));

            await validator.validateAddOnDirectory(run.root, run.addOnName);
            analyticsService.postEvent.resolves();

            assert.equal(logger.warning.callCount, 2);
            assert.equal(
                logger.warning
                    .getCall(0)
                    .calledWith(`The directory ${run.addOnName} contains files that could conflict:`, {
                        postfix: "\n"
                    }),
                true
            );

            assert.equal(logger.warning.getCall(1).calledWith(`${run.files[0].name}`, { prefix: "  " }), true);

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information.calledWith("Either try using a new Add-on name, or remove the files listed above.", {
                    prefix: "\n"
                }),
                true
            );

            assert.equal(processExitStub.callCount, 1);
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.ERROR_INVALID_NAME_DIR,
                    "Invalid Add-on name. Conflicting directory with same name exists"
                ),
                true
            );
            assert.equal(processExitStub.calledWith(0), true);
        });

        runs = [
            {
                root: "/root",
                addOnName: "foo-bar",
                files: [{ name: ".gitignore" }],
                isDirectory: false
            },
            {
                root: "/root",
                addOnName: "foo-bar",
                files: [],
                isDirectory: true
            },
            {
                root: "/root",
                addOnName: "foo-bar",
                files: [{ name: "npm-debug.log" }],
                isDirectory: true
            }
        ];
        runs.forEach(run => {
            it("should return for no files or allowed files in root directory.", async () => {
                const processExitStub = sandbox.stub(process, "exit");

                const ensureDirStub = sandbox.stub(fs, "ensureDirSync");
                ensureDirStub.returns();

                const readDirStub = sandbox.stub(fs, "readdirSync");
                readDirStub.returns(run.files as Dirent[]);

                await validator.validateAddOnDirectory(run.root, run.addOnName);
                analyticsService.postEvent.resolves();
                assert.equal(analyticsService.postEvent.callCount, 0);
                assert.equal(processExitStub.callCount, 0);
            });
        });
    });
});
