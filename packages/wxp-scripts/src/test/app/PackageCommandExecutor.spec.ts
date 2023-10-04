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
import { DEFAULT_OUTPUT_DIRECTORY, DEFAULT_SRC_DIRECTORY } from "@adobe/ccweb-add-on-core";
import type { AccountService } from "@adobe/ccweb-add-on-developer-terms";
import type { AddOnManifestEntrypoint } from "@adobe/ccweb-add-on-manifest";
import type AdmZip from "adm-zip";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { BuildCommandExecutor } from "../../app/index.js";
import { PackageCommandExecutor } from "../../app/index.js";
import { MANIFEST_JSON } from "../../constants.js";
import { PackageCommandOptions } from "../../models/PackageCommandOptions.js";
import { AddOnManifestReader } from "../../utilities/AddOnManifestReader.js";
import { PackageManager } from "../../utilities/PackageManager.js";
import { createManifest } from "../test-utilities.js";

chai.use(chaiAsPromised);

describe("PackageCommandExecutor", () => {
    let sandbox: SinonSandbox;

    let admZipStub: StubbedInstance<AdmZip>;

    let buildCommandExecutor: StubbedInstance<BuildCommandExecutor>;

    let accountService: StubbedInstance<AccountService>;
    let manifestReader: AddOnManifestReader;

    let logger: StubbedInstance<Logger>;

    let packageCommandExecutor: PackageCommandExecutor;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, "log");

        admZipStub = stubInterface<AdmZip>();

        buildCommandExecutor = stubInterface<BuildCommandExecutor>();

        accountService = stubInterface();
        accountService.isUserPrivileged.resolves(true);
        manifestReader = new AddOnManifestReader(accountService);

        logger = stubInterface<Logger>();

        packageCommandExecutor = new PackageCommandExecutor(buildCommandExecutor, logger, manifestReader);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("execute ...", () => {
        it("should create zip successfully if manifest validation passes and main file is present.", async () => {
            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.returns();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(distPath).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", true, true);
            await packageCommandExecutor.execute(options);
            assert.equal(logger.information.callCount, 1);
            assert.equal(logger.success.callCount, 1);
            assert.equal(buildCommandExecutor.execute.callCount, 1);
            assert.equal(admZipStub.writeZip.callCount, 1);
        });

        it("should create zip successfully without rebuilding if --no-rebuild flag is passed.", async () => {
            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.returns();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(distPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", false, false);
            await packageCommandExecutor.execute(options);
            assert.equal(logger.information.callCount, 1);
            assert.equal(logger.success.callCount, 1);
            assert.equal(buildCommandExecutor.execute.callCount, 0);
            assert.equal(admZipStub.writeZip.callCount, 1);
        });

        it(`should first check if the ${DEFAULT_OUTPUT_DIRECTORY} folder exists when --no-rebuild flag is passed.`, async () => {
            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.returns();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(false);
            fsExistsSyncStub.withArgs(manifestPath).returns(false);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            (manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(true);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", false, false);
            await expect(packageCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(buildCommandExecutor.execute.callCount, 0);
            assert.equal(logger.information.callCount, 0);

            assert.equal(logger.error.callCount, 3);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find the ${DEFAULT_OUTPUT_DIRECTORY} directory.`),
                true
            );
            assert.equal(logger.error.getCall(2).calledWith(`Please build your add-on.`), true);

            assert.equal(admZipStub.writeZip.callCount, 0);
        });

        it("should validate manifest file if --no-rebuild flag is passed.", async () => {
            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.returns();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(false);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", false, false);
            await expect(packageCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(buildCommandExecutor.execute.callCount, 0);
            assert.equal(logger.information.callCount, 0);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`Could not find ${MANIFEST_JSON} in ${DEFAULT_OUTPUT_DIRECTORY}.`),
                true
            );

            assert.equal(admZipStub.writeZip.callCount, 0);
        });

        it("should validate entrypoints field in manifest file if --no-rebuild flag is passed.", async () => {
            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.returns();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);
            const { manifestProperties } = createManifest();

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(true);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            manifestProperties.entryPoints = [];
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", false, false);
            await expect(packageCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(buildCommandExecutor.execute.callCount, 0);
            assert.equal(logger.information.callCount, 0);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error.getCall(1).calledWith(`/entryPoints - At least one entrypoint should be defined`),
                true
            );

            assert.equal(admZipStub.writeZip.callCount, 0);
        });

        it("should validate if the files specified in the entrypoints array in the manifest file exist when --no-rebuild flag is passed.", async () => {
            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.returns();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);
            const manifest = createManifest();

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));
            const entryPoints = manifest.entryPoints;

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            fsReadFileSyncStub.returns(JSON.stringify(manifest.manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (manifest.manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                fsExistsSyncStub.withArgs(entryPointPath).returns(false);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return false;
                    }
                });
            });

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", false, false);
            await expect(packageCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(buildCommandExecutor.execute.callCount, 0);
            assert.equal(logger.information.callCount, 0);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error
                    .getCall(1)
                    .calledWith(
                        `Specified main in the ${entryPoints?.[0].type}: ${entryPoints?.[0].main} does not exist in ${DEFAULT_OUTPUT_DIRECTORY}.`
                    ),
                true
            );

            assert.equal(admZipStub.writeZip.callCount, 0);
        });

        it("should validate if the files specified in the entrypoints array in the manifest file exist and is a file when --no-rebuild flag is passed.", async () => {
            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.returns();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);
            const manifest = createManifest();

            const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));
            const entryPoints = manifest.entryPoints;
            const mainEntrypointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoints?.[0].main);

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.withArgs(distPath).returns(true);
            fsExistsSyncStub.withArgs(manifestPath).returns(true);
            fsExistsSyncStub.withArgs(mainEntrypointPath).returns(true);

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(mainEntrypointPath).returns(<Stats>{
                isFile: () => {
                    return false;
                }
            });

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            fsReadFileSyncStub.returns(JSON.stringify(manifest.manifestProperties));

            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.throws();

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", false, false);
            await expect(packageCommandExecutor.execute(options)).to.be.rejectedWith();

            assert.equal(buildCommandExecutor.execute.callCount, 0);
            assert.equal(logger.information.callCount, 0);

            assert.equal(logger.error.callCount, 2);
            assert.equal(logger.error.getCall(0).calledWith("Add-on manifest validation failed."), true);
            assert.equal(
                logger.error
                    .getCall(1)
                    .calledWith(
                        `Specified main in the ${entryPoints?.[0].type}: ${entryPoints?.[0].main} does not exist in ${DEFAULT_OUTPUT_DIRECTORY}.`
                    ),
                true
            );

            assert.equal(admZipStub.writeZip.callCount, 0);
        });

        it("should log error if addLocalFolder return error.", async () => {
            buildCommandExecutor.execute.resolves(true);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.throws();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);

            const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const lstatSyncStub = sandbox.stub(fs, "lstatSync");
            lstatSyncStub.withArgs(path.resolve(DEFAULT_OUTPUT_DIRECTORY)).returns(<Stats>{
                isDirectory: () => {
                    return true;
                }
            });
            lstatSyncStub.withArgs(path.resolve(manifestPath)).returns(<Stats>{
                isFile: () => {
                    return true;
                }
            });
            (manifestProperties.entryPoints as AddOnManifestEntrypoint[]).forEach(entryPoint => {
                const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
                lstatSyncStub.withArgs(entryPointPath).returns(<Stats>{
                    isFile: () => {
                        return true;
                    }
                });
            });

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", true, true);
            await packageCommandExecutor.execute(options);
            assert.equal(logger.information.callCount, 1);
            assert.equal(logger.error.callCount, 1);
        });

        it("shouldn't create a zip if build command fails.", async () => {
            buildCommandExecutor.execute.resolves(false);

            admZipStub.addLocalFolder.returns();
            admZipStub.writeZip.throws();
            sandbox.stub(PackageManager, "generatePackageManager").returns(admZipStub);

            const fsExistsSyncStub = sandbox.stub(fs, "existsSync");
            fsExistsSyncStub.returns(true);

            const fsReadFileSyncStub = sandbox.stub(fs, "readFileSync");
            const { manifestProperties } = createManifest();
            fsReadFileSyncStub.returns(JSON.stringify(manifestProperties));

            const options = new PackageCommandOptions(DEFAULT_SRC_DIRECTORY, "tsc", true, true);
            await packageCommandExecutor.execute(options);
            assert.equal(admZipStub.writeZip.callCount, 0);
        });
    });
});
