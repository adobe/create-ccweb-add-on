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

import { PackageJson, TemplateJson } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import "mocha";
import { PackageBuilder } from "../../app/PackageBuilder.js";

describe("PackageBuilder", () => {
    describe("build", () => {
        describe("buildDevDependencies ...", () => {
            it("should combine devDependencies from package when template does not have devDependencies.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"],
                    devDependencies: { p: "0.1.1", q: "0.1.2", r: "0.1.3" }
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    dependencies: { c: "0.0.3", d: "0.0.4" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });

            it("should combine devDependencies from template when package does not have devDependencies.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"]
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { p: "0.1.1", q: "0.1.2", r: "0.1.3" },
                    dependencies: { c: "0.0.3", d: "0.0.4" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });

            it("should combine devDependencies when both have devDependencies.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"],
                    devDependencies: { m: "1.0.1", n: "1.0.2", o: "1.0.3" }
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    dependencies: { c: "0.0.3", d: "0.0.4" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent,
                    devDependencies: {
                        ...packageJsonContent.devDependencies,
                        ...templateJsonContent.devDependencies
                    }
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });
        });

        describe("buildDependencies ...", () => {
            it("should combine dependencies from package when template does not have dependencies.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"],
                    dependencies: { p: "0.1.1", q: "0.1.2", r: "0.1.3" }
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });

            it("should combine dependencies from template when package does not have dependencies.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"]
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    dependencies: { p: "0.1.1", q: "0.1.2", r: "0.1.3" },
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });

            it("should combine dependencies when both have dependencies.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"],
                    dependencies: { p: "0.1.1", q: "0.1.2", r: "0.1.3" }
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    dependencies: { c: "0.0.3", d: "0.0.4" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent,
                    dependencies: {
                        ...packageJsonContent.dependencies,
                        ...templateJsonContent.dependencies
                    }
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });
        });

        describe("buildScripts ...", () => {
            it("should combine scripts from package when template does not have scripts.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"],
                    scripts: { s: "echo 's'", t: "echo 't'", u: "echo 'u'" }
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    dependencies: { c: "0.0.3", d: "0.0.4" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });

            it("should combine scripts from template when package does not have scripts.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"]
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    dependencies: { c: "0.0.3", d: "0.0.4" },
                    scripts: { s: "echo 's'", t: "echo 't'", u: "echo 'u'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });

            it("should combine scripts when both have scripts.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"],
                    scripts: { s: "echo 's'", t: "echo 't'", u: "echo 'u'" }
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    dependencies: { c: "0.0.3", d: "0.0.4" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    ...templateJsonContent,
                    scripts: { ...packageJsonContent.scripts, ...templateJsonContent.scripts }
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });

            it("should combine package and template when both have all properties.", () => {
                const packageJsonContent = {
                    name: "test-app",
                    version: "1.0.0",
                    description: `WXP panel application.`,
                    keywords: ["adobe", "wxp", "panel"],
                    devDependencies: { p: "0.0.1", q: "0.0.2" },
                    dependencies: { r: "0.0.3", s: "0.0.4" },
                    scripts: { t: "echo 's'", u: "echo 't'", v: "echo 'u'" }
                };
                const packageJson = new PackageJson(packageJsonContent);

                const templateJsonContent = {
                    devDependencies: { a: "0.0.1", b: "0.0.2" },
                    dependencies: { c: "0.0.3", d: "0.0.4" },
                    scripts: { e: "echo 'e'", f: "echo 'f'" }
                };
                const templateJson = new TemplateJson(templateJsonContent);

                const expectedPackageJsonContent = {
                    ...packageJsonContent,
                    devDependencies: {
                        ...packageJsonContent.devDependencies,
                        ...templateJsonContent.devDependencies
                    },
                    dependencies: {
                        ...packageJsonContent.dependencies,
                        ...templateJsonContent.dependencies
                    },
                    scripts: { ...packageJsonContent.scripts, ...templateJsonContent.scripts }
                };

                const packageBuilder = new PackageBuilder(packageJson, templateJson);
                const combinedPackageJson = packageBuilder.build();

                assert.deepEqual(combinedPackageJson, new PackageJson(expectedPackageJsonContent));
            });
        });
    });
});
