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

import type { Logger } from "@adobe/ccweb-add-on-core";
import { PackageJson, TemplateJson, getJSONString } from "@adobe/ccweb-add-on-core";
import { AddOnManifest, EntrypointType } from "@adobe/ccweb-add-on-manifest";
import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs-extra";
import "mocha";
import { createRequire } from "module";
import os from "os";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { fileURLToPath } from "url";
import { AddOnBuilder } from "../../app/AddOnBuilder.js";
import { MANIFEST_JSON, PACKAGE_JSON } from "../../constants.js";
import { ScaffolderOptions } from "../../models/ScaffolderOptions.js";

chai.use(chaiAsPromised);

describe("AddOnBuilder", () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const __require = createRequire(import.meta.url);

    const testAppPackageJson = __require("./data/first-test-app/package.json");

    let logger: StubbedInstance<Logger>;

    beforeEach(() => {
        logger = stubInterface<Logger>();
    });

    describe("getPackageJson", () => {
        it("should return PackageJson from package.json in Add-on directory.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                "react-javascript",
                false
            );

            const expectedPacakgeJson = new PackageJson(testAppPackageJson);

            const addOnBuilder = new AddOnBuilder(options, logger);
            const packageJson = addOnBuilder.getPackageJson();

            assert.deepEqual(packageJson, expectedPacakgeJson);
        });
    });

    describe("getTemplateJson", () => {
        let sandbox: SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("should return empty TemplateJson when template.json does not exist.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                `${__dirname}/data/first-test-app`,
                false
            );

            const expectedTemplateJson = new TemplateJson({});

            const addOnBuilder = new AddOnBuilder(options, logger);
            const templateJson = addOnBuilder.getTemplateJson();

            assert.deepEqual(templateJson, expectedTemplateJson);
        });

        it("should return TemplateJson when template.json exists.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                "shared-storage-javascript",
                false
            );

            sandbox.stub(process, "cwd").returns(options.addOnDirectory);

            const expectedTemplateJson = new TemplateJson({
                scripts: {
                    clean: "ccweb-add-on-scripts clean",
                    build: "ccweb-add-on-scripts build",
                    start: "ccweb-add-on-scripts start"
                },
                devDependencies: {
                    prettier: "2.6.0"
                }
            });

            const addOnBuilder = new AddOnBuilder(options, logger);
            const templateJson = addOnBuilder.getTemplateJson();

            assert.deepEqual(templateJson, expectedTemplateJson);
        });
    });

    describe("getDevDependenciesToInstall", () => {
        it("should return empty set when TemplateJson does not contain devDependencies.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                `${__dirname}/data/first-test-app`,
                false
            );

            const addOnBuilder = new AddOnBuilder(options, logger);
            const devDependencies = addOnBuilder.getDevDependenciesToInstall(new TemplateJson({}));

            assert.equal(devDependencies.size, 0);
        });

        it("should return a set of installable devDependencies from TemplateJson.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                "react-javascript",
                false
            );

            const templateJson = new TemplateJson({
                devDependencies: {
                    a: "1.0.0",
                    b: "2.0.0",
                    c: "3.0.0"
                }
            });

            const expectedDevDependencies = new Set(["a@1.0.0", "b@2.0.0", "c@3.0.0"]);

            const addOnBuilder = new AddOnBuilder(options, logger);
            const devDependencies = addOnBuilder.getDevDependenciesToInstall(templateJson);

            assert.deepEqual(devDependencies, expectedDevDependencies);
        });
    });

    describe("getDependenciesToInstall", () => {
        it("should return empty set when TemplateJson does not contain dependencies.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                `${__dirname}/data/first-test-app`,
                false
            );

            const addOnBuilder = new AddOnBuilder(options, logger);
            const dependencies = addOnBuilder.getDependenciesToInstall(new TemplateJson({}));

            assert.equal(dependencies.size, 0);
        });

        it("should return a set of installable dependencies from TemplateJson.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                "react-javascript",
                false
            );

            const templateJson = new TemplateJson({
                dependencies: {
                    a: "1.0.0",
                    b: "2.0.0",
                    c: "3.0.0"
                }
            });

            const expectedDependencies = new Set(["a@1.0.0", "b@2.0.0", "c@3.0.0"]);

            const addOnBuilder = new AddOnBuilder(options, logger);
            const dependencies = addOnBuilder.getDependenciesToInstall(templateJson);

            assert.deepEqual(dependencies, expectedDependencies);
        });
    });

    describe("build", () => {
        const additionalInfo = {
            sourceId: "fakeAddOnSource",
            privileged: true,
            isDeveloperAddOn: false
        };
        describe("_updateReadMe", () => {
            let sandbox: SinonSandbox;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            const packageJson = new PackageJson({ testAppPackageJson }).toJSON();

            it("should return if README.md does not exist.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/first-test-app`,
                    "first-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);
                const renameSpy = sandbox.spy(fs, "renameSync");

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", "first-test-app", ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);

                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(false);

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();
                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: "first-test-app",
                        name: "first test app",
                        version: "1.0.1",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "first-test-app",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });
                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(renameSpy.callCount, 0);
            });

            it("should rename existing README.md to README.OLD.md if the former exists.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/first-test-app`,
                    "first-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "react-javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(true);

                const renameStub = sandbox.stub(fs, "renameSync");
                renameStub.returns();

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", "first-test-app", ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);

                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(false);

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: "first-test-app",
                        name: "first test app",
                        version: "1.0.1",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "first-test-app",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });

                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(renameStub.callCount, 1);
                assert.equal(
                    renameStub.calledWith(
                        path.join(options.addOnDirectory, "README.md"),
                        path.join(options.addOnDirectory, "README.OLD.md")
                    ),
                    true
                );
            });
        });

        describe("_copyTemplateFiles", () => {
            let sandbox: SinonSandbox;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            const packageJson = new PackageJson({ testAppPackageJson }).toJSON();

            it("should exit if template content directory does not exist.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/first-test-app`,
                    "first-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "react-javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", "first-test-app", ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(false);

                const processExitStub = sandbox.stub(process, "exit");

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);

                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(false);

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: "first-test-app",
                        name: "first test app",
                        version: "1.0.1",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "first-test-app",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });

                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(logger.warning.callCount, 1);
                assert.equal(logger.warning.calledWith(`Could not locate template: ${templateContentDirectory}`), true);

                assert.equal(processExitStub.callCount, 1);
                assert.equal(processExitStub.calledWith(1), true);
            });

            it("should copy template directory contents.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/first-test-app`,
                    "first-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "react-javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", "first-test-app", ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);

                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(false);

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: "first-test-app",
                        name: "first test app",
                        version: "1.0.1",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "first-test-app",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });

                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(copyStub.callCount, 1);
                assert.equal(copyStub.calledWith(templateContentDirectory, options.addOnDirectory), true);
            });
        });

        describe("_updateGitIgnore", () => {
            let sandbox: SinonSandbox;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            const packageJson = new PackageJson({ testAppPackageJson }).toJSON();

            it("should move gitignore to .gitignore if .gitignore does not exist in Add-on diectory.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/second-test-app`,
                    "second-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", options.addOnName, ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);
                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(false);

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: options.addOnName,
                        name: "Second Test App",
                        version: "1.0.1",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "first-test-app",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });

                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(moveStub.callCount, 1);
                assert.equal(
                    moveStub.calledWith(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    ),
                    true
                );
            });

            it("should merge .gitignore files if .gitignore exists in ap directory.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/first-test-app`,
                    "first-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "react-javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", options.addOnName, ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(true);

                const readFileStub = sandbox.stub(fs, "readFileSync");
                const appendFileStub = sandbox.stub(fs, "appendFileSync");
                const unlinkStub = sandbox.stub(fs, "unlinkSync");

                const data = stubInterface<Buffer>();
                readFileStub.withArgs(path.join(options.addOnDirectory, "gitignore")).returns(data);
                appendFileStub.withArgs(path.join(options.addOnDirectory, ".gitignore"), data).returns();
                unlinkStub.withArgs(path.join(options.addOnDirectory, "gitignore")).returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(false);

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: "first-test-app",
                        name: "first test app",
                        version: "1.0.1",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "first-test-app",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });

                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(readFileStub.callCount, 1);
                assert.equal(readFileStub.calledWith(path.join(options.addOnDirectory, "gitignore")), true);

                assert.equal(appendFileStub.callCount, 1);
                assert.equal(appendFileStub.calledWith(path.join(options.addOnDirectory, ".gitignore"), data), true);

                assert.equal(unlinkStub.callCount, 1);
                assert.equal(unlinkStub.calledWith(path.join(options.addOnDirectory, "gitignore")), true);
            });
        });

        describe("_updateManifest", () => {
            let sandbox: SinonSandbox;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            const packageJson = new PackageJson({ testAppPackageJson }).toJSON();

            it("should create new manifest.json if it does not exist in Add-on diectory.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/first-test-app`,
                    "first-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "react-javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", "first-test-app", ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);

                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(false);

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: "first-test-app",
                        name: "first test app",
                        version: "1.0.1",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "first-test-app",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });

                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(writeFileStub.callCount, 2);
            });

            it("should update manifest.json after it has been copied to the app diectory.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/first_test_app`,
                    "first_test_app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "javascript",
                    false
                );

                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", "first_test_app", ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);

                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(true);

                const unlinkStub = sandbox.stub(fs, "unlinkSync");
                unlinkStub.withArgs(manifestJsonPath).returns();

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const { manifest } = AddOnManifest.createManifest({
                    manifest: {
                        testId: "first_test_app",
                        name: "First Test App",
                        version: "1.0.0",
                        manifestVersion: 2,
                        requirements: {
                            apps: [
                                {
                                    name: "Express",
                                    apiVersion: 1
                                }
                            ]
                        },
                        entryPoints: [
                            {
                                type: EntrypointType.PANEL,
                                id: "panel1",
                                main: "index.html"
                            }
                        ]
                    },
                    additionalInfo
                });

                writeFileStub
                    .withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL)
                    .returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(packageJson);

                assert.equal(unlinkStub.callCount, 1);
                assert.equal(unlinkStub.calledWith(manifestJsonPath), true);

                assert.equal(writeFileStub.callCount, 2);
                assert.equal(writeFileStub.getCall(1).calledWith(manifestJsonPath), true);
            });

            it("should not update manifest when it is invalid.", () => {
                const options = new ScaffolderOptions(
                    `${__dirname}/data/third-test-app`,
                    "third-test-app",
                    EntrypointType.PANEL,
                    `${__dirname}/data`,
                    "javascript",
                    false
                );

                const thirdAppPackageJson = __require("./data/third-test-app/package.json");
                const thirdPackageJson = new PackageJson({ thirdAppPackageJson }).toJSON();
                sandbox.stub(process, "cwd").returns(options.addOnDirectory);

                // write package.json stub.
                const writeFileStub = sandbox.stub(fs, "writeFileSync");
                writeFileStub
                    .withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), thirdPackageJson + os.EOL)
                    .returns();

                // _updateReadMe() stub.
                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(false);

                // _copyTemplateFiles() stubs.
                const templateRootDirectory = path.join(__dirname, "data", "third-test-app", ".template");
                const templateContentDirectory = path.join(templateRootDirectory, "template");
                existsStub.withArgs(templateContentDirectory).returns(true);

                const copyStub = sandbox.stub(fs, "copySync");
                copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

                // _updateGitIgnore() stubs.
                existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(false);

                const moveStub = sandbox.stub(fs, "moveSync");
                moveStub
                    .withArgs(
                        path.join(options.addOnDirectory, "gitignore"),
                        path.join(options.addOnDirectory, ".gitignore")
                    )
                    .returns();

                // _updateManifest() stubs.
                const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
                existsStub.withArgs(manifestJsonPath).returns(true);

                const unlinkStub = sandbox.stub(fs, "unlinkSync");
                unlinkStub.withArgs(manifestJsonPath).returns();

                // _removeTemplateTempFiles() stubs.
                sandbox.stub(fs, "removeSync").returns();

                const addOnBuilder = new AddOnBuilder(options, logger);
                addOnBuilder.build(thirdPackageJson);

                assert.equal(writeFileStub.callCount, 1);
                assert.equal(logger.warning.calledOnce, true);
            });
        });
    });

    describe("displaySuccess", () => {
        let sandbox: SinonSandbox;

        const additionalInfo = {
            sourceId: "fakeAddOnSource",
            privileged: true,
            isDeveloperAddOn: false
        };

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        const packageJson = new PackageJson({ testAppPackageJson }).toJSON();

        it("should display success with next steps for the correct root directory and addOndirectory.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `${__dirname}/data`,
                "react-javascript",
                false
            );

            sandbox.stub(process, "cwd").returns(options.addOnDirectory);

            // write package.json stub.
            const writeFileStub = sandbox.stub(fs, "writeFileSync");
            writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

            // _updateReadMe() stub.
            const existsStub = sandbox.stub(fs, "existsSync");
            existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(true);

            const renameStub = sandbox.stub(fs, "renameSync");
            renameStub.returns();

            // _copyTemplateFiles() stubs.
            const templateRootDirectory = path.join(__dirname, "data", options.addOnName, ".template");
            const templateContentDirectory = path.join(templateRootDirectory, "template");
            existsStub.withArgs(templateContentDirectory).returns(true);

            const copyStub = sandbox.stub(fs, "copySync");
            copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

            // _updateGitIgnore() stubs.
            existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(true);

            const readFileStub = sandbox.stub(fs, "readFileSync");
            const appendFileStub = sandbox.stub(fs, "appendFileSync");
            const unlinkStub = sandbox.stub(fs, "unlinkSync");

            const data = stubInterface<Buffer>();
            readFileStub.withArgs(path.join(options.addOnDirectory, "gitignore")).returns(data);
            appendFileStub.withArgs(path.join(options.addOnDirectory, ".gitignore"), data).returns();
            unlinkStub.withArgs(path.join(options.addOnDirectory, "gitignore")).returns();

            // _updateManifest() stubs.
            const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
            existsStub.withArgs(manifestJsonPath).returns(false);

            // _removeTemplateTempFiles() stubs.
            sandbox.stub(fs, "removeSync").returns();

            const { manifest } = AddOnManifest.createManifest({
                manifest: {
                    testId: "first-test-app",
                    name: "first test app",
                    version: "1.0.1",
                    manifestVersion: 2,
                    requirements: {
                        apps: [
                            {
                                name: "Express",
                                apiVersion: 1
                            }
                        ]
                    },
                    entryPoints: [
                        {
                            type: EntrypointType.PANEL,
                            id: "first-test-app",
                            main: "index.html"
                        }
                    ]
                },
                additionalInfo
            });

            writeFileStub.withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL).returns();

            const addOnBuilder = new AddOnBuilder(options, logger);
            addOnBuilder.build(packageJson);
            addOnBuilder.displaySuccess();
            assert.equal(logger.message.callCount, 3);

            assert.equal(
                logger.message.getCall(0).calledWith("Builds the Add-on.", {
                    prefix: "    "
                }),
                true
            );
            assert.equal(
                logger.message.getCall(1).calledWith("Starts the development server and hosts the Add-on.", {
                    prefix: "    "
                }),
                true
            );
            assert.equal(
                logger.message.getCall(2).calledWith("We suggest that you begin by typing:", {
                    prefix: "\n",
                    postfix: "\n"
                }),
                true
            );

            assert.equal(logger.information.callCount, 4);
            assert.equal(
                logger.information.getCall(0).calledWith("npm run build", {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.information.getCall(1).calledWith("npm run start", {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.information.getCall(2).calledWith("npm run build", {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.information.getCall(3).calledWith("npm run start", {
                    prefix: "  ",
                    postfix: "\n"
                }),
                true
            );

            assert.equal(logger.success.callCount, 2);
            assert.equal(
                logger.success
                    .getCall(0)
                    .calledWith(`Success! Created ${options.addOnName} at ${options.addOnDirectory}.`),
                true
            );
            assert.equal(
                logger.success.getCall(1).calledWith(`Inside this directory, you can run the following commands:`, {
                    postfix: "\n"
                }),
                true
            );

            assert.equal(logger.warning.callCount, 4);
            assert.equal(
                logger.warning.getCall(0).calledWith(`cd ${options.addOnName}`, {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.warning.getCall(1).calledWith("You had a 'README.md' file, we renamed it to 'README.OLD.md'", {
                    postfix: "\n"
                }),
                true
            );
            assert.equal(
                logger.warning
                    .getCall(2)
                    .calledWith("You had a '.gitignore' file, we merged it with the template '.gitignore'", {
                        postfix: "\n"
                    }),
                true
            );
            assert.equal(
                logger.warning.getCall(3).calledWith("So what will you create today?", {
                    postfix: "\n"
                }),
                true
            );
        });

        it("should display success with next steps for the incorrect root directory and addOndirectory.", () => {
            const options = new ScaffolderOptions(
                `${__dirname}/data/first-test-app`,
                "first-test-app",
                EntrypointType.PANEL,
                `data`,
                "react-javascript",
                false
            );

            sandbox.stub(process, "cwd").returns(options.addOnDirectory);

            // write package.json stub.
            const writeFileStub = sandbox.stub(fs, "writeFileSync");
            writeFileStub.withArgs(path.join(options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL).returns();

            // _updateReadMe() stub.
            const existsStub = sandbox.stub(fs, "existsSync");
            existsStub.withArgs(path.join(options.addOnDirectory, "README.md")).returns(true);

            const renameStub = sandbox.stub(fs, "renameSync");
            renameStub.returns();

            // _copyTemplateFiles() stubs.
            const templateRootDirectory = path.join(__dirname, "data", options.addOnName, ".template");
            const templateContentDirectory = path.join(templateRootDirectory, "template");
            existsStub.withArgs(templateContentDirectory).returns(true);

            const copyStub = sandbox.stub(fs, "copySync");
            copyStub.withArgs(templateContentDirectory, options.addOnDirectory).returns();

            // _updateGitIgnore() stubs.
            existsStub.withArgs(path.join(options.addOnDirectory, ".gitignore")).returns(true);

            const readFileStub = sandbox.stub(fs, "readFileSync");
            const appendFileStub = sandbox.stub(fs, "appendFileSync");
            const unlinkStub = sandbox.stub(fs, "unlinkSync");

            const data = stubInterface<Buffer>();
            readFileStub.withArgs(path.join(options.addOnDirectory, "gitignore")).returns(data);
            appendFileStub.withArgs(path.join(options.addOnDirectory, ".gitignore"), data).returns();
            unlinkStub.withArgs(path.join(options.addOnDirectory, "gitignore")).returns();

            // _updateManifest() stubs.
            const manifestJsonPath = path.join(options.addOnDirectory, "src", MANIFEST_JSON);
            existsStub.withArgs(manifestJsonPath).returns(false);

            // _removeTemplateTempFiles() stubs.
            sandbox.stub(fs, "removeSync").returns();

            const { manifest } = AddOnManifest.createManifest({
                manifest: {
                    testId: "first-test-app",
                    name: "first test app",
                    version: "1.0.1",
                    manifestVersion: 2,
                    requirements: {
                        apps: [
                            {
                                name: "Express",
                                apiVersion: 1
                            }
                        ]
                    },
                    entryPoints: [
                        {
                            type: EntrypointType.PANEL,
                            id: "first-test-app",
                            main: "index.html"
                        }
                    ]
                },
                additionalInfo
            });

            writeFileStub.withArgs(manifestJsonPath, getJSONString(manifest!.manifestProperties) + os.EOL).returns();

            const addOnBuilder = new AddOnBuilder(options, logger);
            addOnBuilder.build(packageJson);
            addOnBuilder.displaySuccess();

            assert.equal(logger.message.callCount, 3);

            assert.equal(
                logger.message.getCall(0).calledWith("Builds the Add-on.", {
                    prefix: "    "
                }),
                true
            );
            assert.equal(
                logger.message.getCall(1).calledWith("Starts the development server and hosts the Add-on.", {
                    prefix: "    "
                }),
                true
            );
            assert.equal(
                logger.message.getCall(2).calledWith("We suggest that you begin by typing:", {
                    prefix: "\n",
                    postfix: "\n"
                }),
                true
            );

            assert.equal(logger.information.callCount, 4);
            assert.equal(
                logger.information.getCall(0).calledWith("npm run build", {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.information.getCall(1).calledWith("npm run start", {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.information.getCall(2).calledWith("npm run build", {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.information.getCall(3).calledWith("npm run start", {
                    prefix: "  ",
                    postfix: "\n"
                }),
                true
            );

            assert.equal(logger.success.callCount, 2);
            assert.equal(
                logger.success
                    .getCall(0)
                    .calledWith(`Success! Created ${options.addOnName} at ${options.addOnDirectory}.`),
                true
            );
            assert.equal(
                logger.success.getCall(1).calledWith(`Inside this directory, you can run the following commands:`, {
                    postfix: "\n"
                }),
                true
            );

            assert.equal(logger.warning.callCount, 4);
            assert.equal(
                logger.warning.getCall(0).calledWith(`cd ${options.addOnDirectory}`, {
                    prefix: "  "
                }),
                true
            );
            assert.equal(
                logger.warning.getCall(1).calledWith("You had a 'README.md' file, we renamed it to 'README.OLD.md'", {
                    postfix: "\n"
                }),
                true
            );
            assert.equal(
                logger.warning
                    .getCall(2)
                    .calledWith("You had a '.gitignore' file, we merged it with the template '.gitignore'", {
                        postfix: "\n"
                    }),
                true
            );
            assert.equal(
                logger.warning.getCall(3).calledWith("So what will you create today?", {
                    postfix: "\n"
                }),
                true
            );
        });
    });
});
