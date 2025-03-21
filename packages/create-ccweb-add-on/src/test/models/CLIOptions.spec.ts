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
import { CLIOptions } from "../../models/index.js";

describe("CLIOptions", () => {
    describe("constructor", () => {
        it("should create a new instance of CLIOptions.", () => {
            const entrypointType = EntrypointType.PANEL;
            const addOnName = "test-app";
            const templateName = "javascript";
            const verbose = false;

            const cliOptions = new CLIOptions(entrypointType as EntrypointType, addOnName, templateName, verbose);

            assert.equal(cliOptions.entrypointType, entrypointType);
            assert.equal(cliOptions.addOnName, addOnName);
            assert.equal(cliOptions.templateName, templateName);
            assert.equal(cliOptions.verbose, verbose);
        });
    });
});
