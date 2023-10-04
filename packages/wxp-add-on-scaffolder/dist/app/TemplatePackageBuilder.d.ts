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
import type { TemplateJson } from "@adobe/ccweb-add-on-core";
import { PackageJson } from "@adobe/ccweb-add-on-core";
import type { PackageBuilder } from "./PackageBuilder.js";
/**
 * Package builder implementation class for constructing the package.json of the Add-on project.
 */
export declare class TemplatePackageBuilder implements PackageBuilder {
    private _combinedPackage;
    private _templateJson;
    /**
     * Instantiate {@link TemplatePackageBuilder}.
     *
     * @param packageJson - {@link PackageJson}.
     * @param templateJson - {@link TemplateJson}.
     * @returns Reference to a new {@link TemplatePackageBuilder} instance.
     */
    constructor(packageJson: PackageJson, templateJson: TemplateJson);
    /**
     * Build {@link PackageJson}.
     */
    build(): PackageJson;
    private _buildDevDependencies;
    private _buildDependencies;
    private _buildScripts;
}
//# sourceMappingURL=TemplatePackageBuilder.d.ts.map