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
import { TemplateJson } from "../../models/TemplateJson.js";

describe("TemplateJson", () => {
    describe("constructor ...", () => {
        it(`should not set any properties when the constructor argument is undefined.`, () => {
            const templateJson = new TemplateJson({});
            assert.isDefined(templateJson);
            assert.isUndefined(templateJson.devDependencies);
            assert.isUndefined(templateJson.dependencies);
            assert.isUndefined(templateJson.scripts);
        });

        it(`should only set devDependencies when the constructor argument only contains devDependencies.`, () => {
            const content = {
                devDependencies: {
                    a: "1.0.0",
                    b: "2.0.0"
                }
            };

            let templateJson = new TemplateJson(content);
            assert.isDefined(templateJson);

            assert.isDefined(templateJson.devDependencies);
            assert.equal(templateJson.devDependencies?.get("a"), content.devDependencies.a);
            assert.equal(templateJson.devDependencies?.get("b"), content.devDependencies.b);

            assert.isUndefined(templateJson.dependencies);
            assert.isUndefined(templateJson.scripts);

            const contentMap = {
                devDependencies: new Map([
                    ["a", "1.0.0"],
                    ["b", "2.0.0"]
                ])
            };

            templateJson = new TemplateJson(contentMap);
            assert.isDefined(templateJson);

            assert.isDefined(templateJson.devDependencies);
            assert.equal(templateJson.devDependencies?.get("a"), content.devDependencies.a);
            assert.equal(templateJson.devDependencies?.get("b"), content.devDependencies.b);

            assert.isUndefined(templateJson.dependencies);
            assert.isUndefined(templateJson.scripts);
        });

        it(`should only set dependencies when the constructor argument only contains dependencies.`, () => {
            const content = {
                dependencies: {
                    c: "3.0.0",
                    d: "4.0.0"
                }
            };

            let templateJson = new TemplateJson(content);
            assert.isDefined(templateJson);

            assert.isDefined(templateJson.dependencies);
            assert.equal(templateJson.dependencies?.get("c"), content.dependencies.c);
            assert.equal(templateJson.dependencies?.get("d"), content.dependencies.d);

            assert.isUndefined(templateJson.devDependencies);
            assert.isUndefined(templateJson.scripts);

            const contentMap = {
                dependencies: new Map([
                    ["c", "3.0.0"],
                    ["d", "4.0.0"]
                ])
            };

            templateJson = new TemplateJson(contentMap);
            assert.isDefined(templateJson);

            assert.isDefined(templateJson.dependencies);
            assert.equal(templateJson.dependencies?.get("c"), content.dependencies.c);
            assert.equal(templateJson.dependencies?.get("d"), content.dependencies.d);

            assert.isUndefined(templateJson.devDependencies);
            assert.isUndefined(templateJson.scripts);
        });

        it(`should only set scripts when the constructor argument only contains scripts.`, () => {
            const content = {
                scripts: {
                    e: "clean",
                    f: "build"
                }
            };

            let templateJson = new TemplateJson(content);
            assert.isDefined(templateJson);

            assert.isDefined(templateJson.scripts);
            assert.equal(templateJson.scripts?.get("e"), content.scripts.e);
            assert.equal(templateJson.scripts?.get("f"), content.scripts.f);

            assert.isUndefined(templateJson.devDependencies);
            assert.isUndefined(templateJson.dependencies);

            const contentMap = {
                scripts: new Map([
                    ["e", "clean"],
                    ["f", "build"]
                ])
            };

            templateJson = new TemplateJson(contentMap);
            assert.isDefined(templateJson);

            assert.isDefined(templateJson.scripts);
            assert.equal(templateJson.scripts?.get("e"), content.scripts.e);
            assert.equal(templateJson.scripts?.get("f"), content.scripts.f);

            assert.isUndefined(templateJson.devDependencies);
            assert.isUndefined(templateJson.dependencies);
        });

        it(`should set all properties when the constructor argument contains them.`, () => {
            const content = {
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

            const templateJson = new TemplateJson(content);
            assert.isDefined(templateJson);

            assert.isDefined(templateJson.devDependencies);
            assert.equal(templateJson.devDependencies?.get("a"), content.devDependencies.a);
            assert.equal(templateJson.devDependencies?.get("b"), content.devDependencies.b);

            assert.isDefined(templateJson.dependencies);
            assert.equal(templateJson.dependencies?.get("c"), content.dependencies.c);
            assert.equal(templateJson.dependencies?.get("d"), content.dependencies.d);

            assert.isDefined(templateJson.scripts);
            assert.equal(templateJson.scripts?.get("e"), content.scripts.e);
            assert.equal(templateJson.scripts?.get("f"), content.scripts.f);
        });
    });
});
