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
import type { Logger } from "@adobe/ccweb-add-on-core";
import { PackageJson, TemplateJson } from "@adobe/ccweb-add-on-core";
import "reflect-metadata";
import type { ScaffolderOptions } from "../models/ScaffolderOptions.js";
import type { AddOnBuilder } from "./AddOnBuilder.js";
/**
 * App builder implementation class for constructing the Add-on project.
 */
export declare class TemplateAddOnBuilder implements AddOnBuilder {
    private readonly _logger;
    private _options;
    private _require;
    private _templateRootDirectory;
    private _gitignoreExists;
    private _readmeExists;
    /**
     * Instantiate {@link TemplateAddOnBuilder}.
     *
     * @param options - {@link ScaffolderOptions}.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link TemplateAddOnBuilder} instance.
     */
    constructor(options: ScaffolderOptions, logger: Logger);
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
    private _updateReadMe;
    private _copyTemplateFiles;
    private _updateGitIgnore;
    private _updateManifest;
    private _getAddOnName;
    private _removeTemplateTempFiles;
}
//# sourceMappingURL=TemplateAddOnBuilder.d.ts.map