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

import { assert } from "chai";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import { AddOnDirectory } from "../../models/AddOnDirectory.js";
import { createManifest } from "../test-utilities.js";

describe("AddOnDirectory", () => {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("constructor", () => {
        const runs = [
            {
                srcDirectory: "src",
                manifest: createManifest()
            }
        ];
        runs.forEach(run => {
            it("should create a new instance for an Add-on.", () => {
                const cwd = "/users/xrx/project-foo";
                sandbox.stub(process, "cwd").returns(cwd);

                const addOnDirectory = new AddOnDirectory(run.srcDirectory, run.manifest);
                assert.equal(addOnDirectory.srcDirName, run.srcDirectory);
                assert.deepEqual(addOnDirectory.manifest, run.manifest);

                assert.equal(addOnDirectory.rootDirName, path.basename(cwd));
                assert.equal(addOnDirectory.rootDirPath, cwd);
                assert.equal(addOnDirectory.srcDirPath, path.join(cwd, run.srcDirectory));
            });
        });

        it("should set rootDirName from cwd and resolve rootDirPath/srcDirPath for absolute srcDirName.", () => {
            const cwd = "/some/other/workdir";
            sandbox.stub(process, "cwd").returns(cwd);

            const absSrc = path.join("/users/xrx", "my-addon", "src");
            const manifest = createManifest();
            const addOnDirectory = new AddOnDirectory(absSrc, manifest);

            const expectedRoot = path.resolve(absSrc, "..");

            assert.equal(addOnDirectory.rootDirName, path.basename(cwd));
            assert.equal(addOnDirectory.rootDirPath, expectedRoot);
            assert.equal(addOnDirectory.srcDirPath, path.join(expectedRoot, absSrc));
        });
    });
});
