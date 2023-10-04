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
import { injectable } from "inversify";
import type { PackageBuilder } from "./PackageBuilder.js";

/**
 * Package builder implementation class for constructing the package.json of the Add-on project.
 */
@injectable()
export class TemplatePackageBuilder implements PackageBuilder {
    private _combinedPackage: PackageJson;
    private _templateJson: TemplateJson;

    /**
     * Instantiate {@link TemplatePackageBuilder}.
     *
     * @param packageJson - {@link PackageJson}.
     * @param templateJson - {@link TemplateJson}.
     * @returns Reference to a new {@link TemplatePackageBuilder} instance.
     */
    constructor(packageJson: PackageJson, templateJson: TemplateJson) {
        this._combinedPackage = new PackageJson({ ...packageJson });
        this._templateJson = templateJson;
    }

    /**
     * Build {@link PackageJson}.
     */
    build(): PackageJson {
        this._buildDevDependencies();
        this._buildDependencies();
        this._buildScripts();

        return this._combinedPackage;
    }

    private _buildDevDependencies(): void {
        if (!this._templateJson.devDependencies || this._templateJson.devDependencies.size === 0) {
            return;
        }

        this._templateJson.devDependencies.forEach((value, key) => {
            if (!this._combinedPackage.devDependencies) {
                this._combinedPackage.devDependencies = new Map<string, string>();
            }

            this._combinedPackage.devDependencies.set(key, value);
        });
    }

    private _buildDependencies(): void {
        if (!this._templateJson.dependencies || this._templateJson.dependencies.size === 0) {
            return;
        }

        this._templateJson.dependencies.forEach((value, key) => {
            if (!this._combinedPackage.dependencies) {
                this._combinedPackage.dependencies = new Map<string, string>();
            }

            this._combinedPackage.dependencies.set(key, value);
        });
    }

    private _buildScripts(): void {
        if (!this._templateJson.scripts || this._templateJson.scripts.size === 0) {
            return;
        }

        this._templateJson.scripts.forEach((value, key) => {
            if (!this._combinedPackage.scripts) {
                this._combinedPackage.scripts = new Map<string, string>();
            }

            this._combinedPackage.scripts.set(key, value);
        });
    }
}
