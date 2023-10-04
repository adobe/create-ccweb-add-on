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

import type { Process } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import fs from "fs-extra";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { ScriptManager } from "../../app/index.js";
import { WxpScriptManager } from "../../app/index.js";
import { MANIFEST_JSON } from "../../constants.js";

describe("WxpScriptManager", () => {
    let sandbox: SinonSandbox;

    let cliProcess: StubbedInstance<Process>;
    let scriptManager: ScriptManager;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        cliProcess = stubInterface<Process>();
        scriptManager = new WxpScriptManager(cliProcess);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("cleanDirectory", () => {
        it("should remove and create a directory.", async () => {
            const directory = "output-directory";

            const removeStub = sandbox.stub(fs, "removeSync");
            removeStub.withArgs(directory).returns();

            const ensureDirStub = sandbox.stub(fs, "ensureDirSync");
            ensureDirStub.withArgs(directory).returns();

            await scriptManager.cleanDirectory(directory);

            assert.equal(removeStub.callCount, 1);
            assert.equal(removeStub.calledWith(directory), true);

            assert.equal(ensureDirStub.callCount, 1);
            assert.equal(ensureDirStub.calledWith(directory), true);
        });
    });

    describe("cleanDirectoryAndAddManifest", () => {
        it("should remove all files in the directory except manifest.json.", async () => {
            const directory = "output-directory";

            const removeStub = sandbox.stub(fs, "removeSync");
            removeStub.withArgs(directory).returns();

            const ensureDirStub = sandbox.stub(fs, "ensureDirSync");
            ensureDirStub.withArgs(directory).returns();

            const manifestJsonPath = `/source-directory/${MANIFEST_JSON}`;

            const copyFileStub = sandbox.stub(fs, "copyFileSync");
            copyFileStub
                .withArgs(manifestJsonPath, path.join(directory, MANIFEST_JSON), fs.constants.COPYFILE_EXCL)
                .returns();

            await scriptManager.cleanDirectoryAndAddManifest(directory, manifestJsonPath);

            assert.equal(removeStub.callCount, 1);
            assert.equal(removeStub.calledWith(directory), true);

            assert.equal(ensureDirStub.callCount, 1);
            assert.equal(ensureDirStub.calledWith(directory), true);

            assert.equal(copyFileStub.callCount, 1);
            assert.equal(
                copyFileStub.calledWith(
                    manifestJsonPath,
                    path.join(directory, MANIFEST_JSON),
                    fs.constants.COPYFILE_EXCL
                ),
                true
            );
        });
    });

    describe("transpile", () => {
        const runs = [
            { transpiler: "webpack", isSuccessful: true },
            { transpiler: "random", isSuccessful: false }
        ];
        runs.forEach(run => {
            it(`should transpile using ${run.transpiler}, and return whether the transpilation was successful.`, async () => {
                cliProcess.execute
                    .withArgs(run.transpiler, [], { stdio: "inherit" })
                    .resolves({ command: run.transpiler, isSuccessful: run.isSuccessful });

                const result = await scriptManager.transpile(run.transpiler);
                assert.equal(result, run.isSuccessful);
                assert.equal(cliProcess.execute.callCount, 1);
                assert.equal(cliProcess.execute.calledWith(run.transpiler, [], { stdio: "inherit" }), true);
            });
        });
    });

    describe("copyStaticFiles", () => {
        it("should copy files which do not require transpilation.", async () => {
            const sourceDirectory = "src";
            const destinationDirectory = "dist";

            const copyStub = sandbox.stub(fs, "copy");
            copyStub.resolves();

            await scriptManager.copyStaticFiles(sourceDirectory, destinationDirectory);

            assert.equal(copyStub.callCount, 1);
        });
    });
});
