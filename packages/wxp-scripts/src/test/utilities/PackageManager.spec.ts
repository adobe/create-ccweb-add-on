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
import { PackageManager } from "../../utilities/PackageManager.js";

describe("PackageManager", () => {
    describe("generatePackageManager ...", () => {
        it("should return bundler successfully.", async () => {
            const bundleManager = PackageManager.generatePackageManager();
            assert.isDefined(bundleManager);
            assert.isDefined(bundleManager.addLocalFolder);
            assert.isDefined(bundleManager.writeZip);
        });
    });
    describe("filterOSFiles ...", () => {
        const runs = [
            {
                fileName: ".DS_Store",
                result: false
            },
            {
                fileName: "__MACOSX",
                result: false
            },
            {
                fileName: "index.js",
                result: true
            }
        ];

        runs.forEach(run => {
            it("should return false if MacOS files are there.", async () => {
                const filterResult = PackageManager.filterOSFiles(run.fileName);
                assert.equal(filterResult, run.result);
            });
        });
    });
});
