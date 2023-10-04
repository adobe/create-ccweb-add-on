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
import type { Stats } from "fs";
import type { Dirent } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import {
    getBaseUrl,
    getJSONString,
    isFile,
    isNullOrWhiteSpace,
    isObject,
    removeSymbols,
    traverseDirectory
} from "../../utilities/Extensions.js";

describe("Extensions", () => {
    describe("getJSONString", () => {
        it(`should return stringify-ed PackageJson with properties except for the undefined ones.`, () => {
            const item = {
                foo: "bar",
                baz: "etc"
            };

            const itemJSONString = getJSONString(item);

            assert.equal(removeSymbols(itemJSONString), removeSymbols(`{    "foo": "bar",    "baz": "etc"}`));
        });
    });

    describe("isNullOrWhiteSpace", () => {
        let runs = [{ value: null }, { value: undefined }, { value: "" }, { value: " " }, { value: "  " }];
        runs.forEach(run => {
            it("should return true for a null, undefined or whitespace.", () => {
                assert.equal(isNullOrWhiteSpace(run.value), true);
            });
        });

        runs = [{ value: "foo bar" }, { value: " foo bar " }];
        runs.forEach(run => {
            it("should return false for not a null or undefined or whitespace.", () => {
                assert.equal(isNullOrWhiteSpace(run.value), false);
            });
        });
    });

    describe("isObject", () => {
        let runs: { value: unknown }[] = [
            { value: null },
            { value: undefined },
            { value: "hello world" },
            { value: 10 },
            { value: true }
        ];
        runs.forEach(run => {
            it("should return false for a null, undefined or any primitive type.", () => {
                assert.equal(isObject(run.value), false);
            });
        });

        runs = [
            { value: { foo: "bar" } },
            { value: ["hello", "world"] },
            { value: new Set([1, 2, 3]) },
            { value: new Map([["foo", "bar"]]) }
        ];
        runs.forEach(run => {
            it("should return true for an object, array or any iterable.", () => {
                assert.equal(isObject(run.value), true);
            });
        });
    });

    describe("traverseDirectory", () => {
        let sandbox: SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("should traverse through all files recursively in a directory and execute action on each file.", () => {
            const logStub = sandbox.stub(console, "log");
            logStub.returns();

            const rootDirectory = "root";
            const childDirectory = "child";
            const rootFiles = [
                { name: "file-1.html" },
                { name: "file-2.js" },
                { name: "file-3.css" },
                { name: childDirectory }
            ] as Dirent[];
            const readDirStub = sandbox.stub(fs, "readdirSync");
            readDirStub.withArgs(rootDirectory, { withFileTypes: true }).returns(rootFiles);

            const directoryStats = <Stats>{
                isDirectory: () => {
                    return true;
                }
            };
            const fileStats = <Stats>{
                isDirectory: () => {
                    return false;
                }
            };

            const lstatStub = sandbox.stub(fs, "lstatSync");
            rootFiles.forEach(file => {
                if (file.name === childDirectory) {
                    lstatStub.withArgs(path.join(rootDirectory, file.name)).returns(directoryStats);
                } else {
                    lstatStub.withArgs(path.join(rootDirectory, file.name)).returns(fileStats);
                }
            });

            const childFiles = [{ name: "file-4.ts" }, { name: "file-5.tsx" }] as Dirent[];
            readDirStub.withArgs(path.join(rootDirectory, childDirectory), { withFileTypes: true }).returns(childFiles);
            childFiles.forEach(file => {
                lstatStub.withArgs(path.join(rootDirectory, childDirectory, file.name)).returns(fileStats);
            });

            traverseDirectory(rootDirectory, file => console.log(file));

            assert.equal(logStub.callCount, 5);
            sinon.assert.calledWith(logStub.getCall(0), sinon.match(path.join(rootDirectory, "file-1.html")));
            sinon.assert.calledWith(logStub.getCall(1), sinon.match(path.join(rootDirectory, "file-2.js")));
            sinon.assert.calledWith(logStub.getCall(2), sinon.match(path.join(rootDirectory, "file-3.css")));
            sinon.assert.calledWith(
                logStub.getCall(3),
                sinon.match(path.join(rootDirectory, childDirectory, "file-4.ts"))
            );
            sinon.assert.calledWith(
                logStub.getCall(4),
                sinon.match(path.join(rootDirectory, childDirectory, "file-5.tsx"))
            );
        });
    });

    describe("getBaseUrl", () => {
        const runs = [
            {
                protocol: "https",
                host: "localhost:5241",
                expectedBaseUrl: "https://localhost:5241/"
            },
            {
                protocol: "https",
                host: "spice.adobe.com",
                expectedBaseUrl: "https://spice.adobe.com/"
            },
            { protocol: "wss", host: "localhost:5241", expectedBaseUrl: "wss://localhost:5241/" },
            { protocol: "wss", host: "spice.adobe.com", expectedBaseUrl: "wss://spice.adobe.com/" }
        ];
        runs.forEach(run => {
            it("should return the Base URL from protocol and host.", () => {
                const baseUrl = getBaseUrl(run.protocol, run.host);
                assert.equal(baseUrl, run.expectedBaseUrl);
            });
        });
    });

    describe("removeSymbols", () => {
        it("should remove symbols from a string.", () => {
            const value = "Hello\n\r\tWorld";
            const expectedValue = "HelloWorld";

            assert.equal(removeSymbols(value), expectedValue);
        });
    });

    describe("isFile", () => {
        let sandbox: SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("should return false when the path does not exist.", () => {
            const path = "foo/bar/";

            sandbox.stub(fs, "existsSync").returns(false);

            assert.equal(isFile(path), false);
        });

        it("should return false when the path is a directory.", () => {
            const path = "foo/bar/";

            sandbox.stub(fs, "existsSync").returns(true);

            const directoryStats = <Stats>{ isFile: () => false };
            sandbox.stub(fs, "lstatSync").returns(directoryStats);

            assert.equal(isFile(path), false);
        });

        it("should return true when the path is of a file.", () => {
            const path = "foo/bar/";

            sandbox.stub(fs, "existsSync").returns(true);

            const directoryStats = <Stats>{ isFile: () => true };
            sandbox.stub(fs, "lstatSync").returns(directoryStats);

            assert.equal(isFile(path), true);
        });
    });
});
