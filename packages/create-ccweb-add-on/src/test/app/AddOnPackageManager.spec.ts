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

import { PackageJson } from "@adobe/ccweb-add-on-core";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { assert } from "chai";
import "mocha";
import { AddOnPackageManager } from "../../app/index.js";

describe("AddOnManager", () => {
    describe("getPackageJson", () => {
        const runs = [{ entrypointType: EntrypointType.PANEL, addOnName: "test-app" }];
        runs.forEach(run => {
            it("should return package.json.", async () => {
                const packageJson = AddOnPackageManager.getPackageJson(
                    run.entrypointType as EntrypointType,
                    run.addOnName
                );
                const expectedPackageJson = new PackageJson({
                    name: run.addOnName,
                    version: "1.0.0",
                    description: "Adobe Creative Cloud Web Add-on.",
                    keywords: ["Adobe", "Creative Cloud Web", "Add-on", run.entrypointType],
                    scripts: {
                        clean: "ccweb-add-on-scripts clean",
                        build: "ccweb-add-on-scripts build",
                        start: "ccweb-add-on-scripts start"
                    }
                });

                assert.deepEqual(packageJson, expectedPackageJson);
            });
        });
    });
});
