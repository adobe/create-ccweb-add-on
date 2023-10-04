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
import { PackageJson } from "../../models/PackageJson.js";
import { removeSymbols } from "../../utilities/Extensions.js";

describe("PackageJson", () => {
    describe("constructor ...", () => {
        it(`should not set any properties when the constructor argument is empty.`, () => {
            const packageJson = new PackageJson({});
            assert.isDefined(packageJson);
            assert.isUndefined(packageJson.name);
            assert.isUndefined(packageJson.version);
            assert.isUndefined(packageJson.description);
            assert.isUndefined(packageJson.keywords);
            assert.isUndefined(packageJson.devDependencies);
            assert.isUndefined(packageJson.dependencies);
            assert.isUndefined(packageJson.scripts);
        });

        it(`should only set name when the constructor argument only contains name.`, () => {
            const content = {
                name: "simple-app"
            };

            const packageJson = new PackageJson(content);
            assert.isDefined(packageJson);
            assert.equal(packageJson.name, content.name);

            assert.isUndefined(packageJson.version);
            assert.isUndefined(packageJson.description);
            assert.isUndefined(packageJson.keywords);

            assert.isUndefined(packageJson.devDependencies);
            assert.isUndefined(packageJson.dependencies);
            assert.isUndefined(packageJson.scripts);
        });

        it(`should only set version when the constructor argument only contains version.`, () => {
            const content = {
                version: "1.0.0"
            };

            const packageJson = new PackageJson(content);
            assert.isDefined(packageJson);
            assert.equal(packageJson.version, content.version);

            assert.isUndefined(packageJson.name);
            assert.isUndefined(packageJson.description);
            assert.isUndefined(packageJson.keywords);

            assert.isUndefined(packageJson.devDependencies);
            assert.isUndefined(packageJson.dependencies);
            assert.isUndefined(packageJson.scripts);
        });

        it(`should only set description when the constructor argument only contains description.`, () => {
            const content = {
                description: "simple app"
            };

            const packageJson = new PackageJson(content);
            assert.isDefined(packageJson);
            assert.equal(packageJson.description, content.description);

            assert.isUndefined(packageJson.name);
            assert.isUndefined(packageJson.version);
            assert.isUndefined(packageJson.keywords);

            assert.isUndefined(packageJson.devDependencies);
            assert.isUndefined(packageJson.dependencies);
            assert.isUndefined(packageJson.scripts);
        });

        it(`should only set keywords when the constructor argument only contains keywords.`, () => {
            const content = {
                keywords: ["simple", "app"]
            };

            const packageJson = new PackageJson(content);
            assert.isDefined(packageJson);
            assert.equal(packageJson.keywords, content.keywords);

            assert.isUndefined(packageJson.name);
            assert.isUndefined(packageJson.description);
            assert.isUndefined(packageJson.version);

            assert.isUndefined(packageJson.devDependencies);
            assert.isUndefined(packageJson.dependencies);
            assert.isUndefined(packageJson.scripts);
        });

        it(`should set all properties when the constructor argument contains them.`, () => {
            const content = {
                name: "simple-app",
                version: "1.0.0",
                description: "simple app",
                keywords: ["simple", "app"],
                devDependencies: {
                    a: "1.0.0",
                    b: "2.0.0"
                },
                dependencies: {
                    c: "3.0.0",
                    d: "4.0.0"
                },
                scripts: {
                    e: "clean",
                    f: "build"
                }
            };

            const packageJson = new PackageJson(content);
            assert.isDefined(packageJson);
            assert.equal(packageJson.name, content.name);
            assert.equal(packageJson.version, content.version);
            assert.equal(packageJson.description, content.description);
            assert.equal(packageJson.keywords, content.keywords);

            assert.isDefined(packageJson.devDependencies);
            assert.equal(packageJson.devDependencies?.get("a"), content.devDependencies.a);
            assert.equal(packageJson.devDependencies?.get("b"), content.devDependencies.b);

            assert.isDefined(packageJson.dependencies);
            assert.equal(packageJson.dependencies?.get("c"), content.dependencies.c);
            assert.equal(packageJson.dependencies?.get("d"), content.dependencies.d);

            assert.isDefined(packageJson.scripts);
            assert.equal(packageJson.scripts?.get("e"), content.scripts.e);
            assert.equal(packageJson.scripts?.get("f"), content.scripts.f);
        });
    });

    describe("toJSON ...", () => {
        it(`should return stringify-ed PackageJson with properties except for the undefined ones.`, () => {
            const content = {
                name: "simple-app",
                version: "1.0.0",
                description: "simple app",
                keywords: ["simple", "app"]
            };

            const packageJson = new PackageJson(content);
            const packageJsonString = packageJson.toJSON();

            assert.equal(removeSymbols(packageJsonString), removeSymbols(JSON.stringify(content, undefined, 4)));
        });

        it(`should return stringify-ed PackageJson with all properties when all are defined.`, () => {
            const content = {
                name: "simple-app",
                version: "1.0.0",
                description: "simple app",
                scripts: {
                    e: "clean",
                    f: "build"
                },
                keywords: ["simple", "app"],
                dependencies: {
                    c: "3.0.0",
                    d: "4.0.0"
                },
                devDependencies: {
                    a: "1.0.0",
                    b: "2.0.0"
                }
            };

            const packageJson = new PackageJson(content);
            const packageJsonString = packageJson.toJSON();

            assert.equal(removeSymbols(packageJsonString), removeSymbols(JSON.stringify(content, undefined, 4)));
        });
    });
});
