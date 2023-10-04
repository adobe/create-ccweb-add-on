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
import type { PackageJson, TemplateJson } from "@adobe/ccweb-add-on-core";
import "reflect-metadata";
import type { ScaffolderOptions } from "../models/ScaffolderOptions.js";
/**
 * Add-on builder interface for constructing the Add-on project.
 */
export interface AddOnBuilder {
    /**
     * Get {@link PackageJson}.
     *
     * @returns Reference of {@link PackageJson}.
     */
    getPackageJson(): PackageJson;
    /**
     * Get {@link TemplateJson}.
     *
     * @returns Reference of {@link TemplateJson}.
     */
    getTemplateJson(): TemplateJson;
    /**
     * Get template devDependencies.
     *
     * @param template - {@link TemplateJson}
     * @returns Set of template devDependencies.
     */
    getDevDependenciesToInstall(template: TemplateJson): Set<string>;
    /**
     * Get template dependencies.
     *
     * @param template - {@link TemplateJson}
     * @returns Set of template dependencies.
     */
    getDependenciesToInstall(template: TemplateJson): Set<string>;
    /**
     * Build the Add-on.
     *
     * @param packageJson - {@link PackageJson}
     */
    build(packageJson: string): void;
    /**
     * Display success message.
     */
    displaySuccess(): void;
}
/**
 * Add-on builder factory.
 */
export declare type AddOnBuilderFactory = (options: ScaffolderOptions) => AddOnBuilder;
//# sourceMappingURL=AddOnBuilder.d.ts.map