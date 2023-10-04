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
import { StartCommandOptions } from "../../models/index.js";

describe("StartCommandOptions", () => {
    describe("constructor", () => {
        const runs = [
            {
                script: "build",
                srcDirectory: "src",
                transpiler: "tsc",
                hostname: "localhost",
                port: 5241,
                verbose: false
            },
            {
                script: "start",
                srcDirectory: "/Users/repository/src",
                transpiler: "webpack",
                hostname: "not.localhost",
                port: 5241,
                verbose: true
            }
        ];
        runs.forEach(run => {
            it(`should create a new instance for: ${run.script} script.`, () => {
                const options = new StartCommandOptions(
                    run.srcDirectory,
                    run.transpiler,
                    run.hostname,
                    run.port,
                    run.verbose
                );

                assert.equal(options.srcDirectory, run.srcDirectory);
                assert.equal(options.transpiler, run.transpiler);
                assert.equal(options.port, run.port);
                assert.equal(options.verbose, run.verbose);
            });
        });
    });
});
