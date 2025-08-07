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

import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { assert } from "chai";
import "mocha";
import { ScaffolderOptions } from "../../models/ScaffolderOptions.js";

describe("ScaffolderOptions", () => {
    describe("constructor", () => {
        const runs = [
            {
                addOnDirectory: "/apps/test-app",
                addOnName: "test-app",
                entrypointType: EntrypointType.PANEL,
                rootDirectory: "/apps",
                templateName: "javascript",
                verbose: false
            }
        ];
        runs.forEach(run => {
            it(`should create a new instance for: ${run.entrypointType}.`, () => {
                const scaffolderOptions = new ScaffolderOptions(
                    run.addOnDirectory,
                    run.addOnName,
                    run.entrypointType as EntrypointType,
                    run.rootDirectory,
                    run.templateName,
                    run.verbose
                );
                assert.equal(scaffolderOptions.addOnDirectory, run.addOnDirectory);
                assert.equal(scaffolderOptions.addOnName, run.addOnName);
                assert.equal(scaffolderOptions.entrypointType, run.entrypointType);
                assert.equal(scaffolderOptions.rootDirectory, run.rootDirectory);
                assert.equal(scaffolderOptions.templateName, run.templateName);
                assert.equal(scaffolderOptions.verbose, run.verbose);
            });
        });
    });
});
