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
import { __decorate, __metadata, __param } from "tslib";
import { ADDITIONAL_ADD_ON_INFO, DEFAULT_OUTPUT_DIRECTORY, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import { ITypes as IDeveloperTermsTypes } from "@adobe/ccweb-add-on-developer-terms";
import { AddOnManifest } from "@adobe/ccweb-add-on-manifest";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import path from "path";
import format from "string-template";
import { MANIFEST_JSON } from "../constants.js";
/**
 * Utility class to read 'manifest.json' file from the add-on directory.
 */
let AddOnManifestReader = class AddOnManifestReader {
    _accountService;
    _addOnManifest;
    _isUserPrivileged;
    /**
     * Instantiate {@link AddOnManifestReader}.
     * @param accountService - {@link AccountService} reference.
     * @returns Reference to a new {@link AddOnManifestReader} instance.
     */
    constructor(accountService) {
        this._accountService = accountService;
    }
    /**
     * Get manifest of the Add-on on which the script is being executed.
     * @param handleValidationFailed - Action to execute when manifest validation fails.
     * @param fromCache - Whether to get the manifest from cache.
     * @returns Add-on manifest represented as {@link AddOnManifest}.
     */
    async getManifest(handleValidationFailed, fromCache = true) {
        if (fromCache && this._addOnManifest !== undefined) {
            return this._addOnManifest;
        }
        const distPath = path.resolve(DEFAULT_OUTPUT_DIRECTORY);
        if (!fs.existsSync(distPath) || !fs.lstatSync(distPath).isDirectory()) {
            handleValidationFailed({
                success: false,
                errorDetails: [
                    { message: `Could not find the ${DEFAULT_OUTPUT_DIRECTORY} directory.` },
                    { message: `Please build your add-on.` }
                ]
            });
            this._addOnManifest = undefined;
            return this._addOnManifest;
        }
        const manifestPath = path.resolve(path.join(DEFAULT_OUTPUT_DIRECTORY, MANIFEST_JSON));
        if (!fs.existsSync(manifestPath) || !fs.lstatSync(manifestPath).isFile()) {
            handleValidationFailed({
                success: false,
                errorDetails: [{ message: `Could not find ${MANIFEST_JSON} in ${DEFAULT_OUTPUT_DIRECTORY}.` }]
            });
            this._addOnManifest = undefined;
            return this._addOnManifest;
        }
        const manifestString = fs.readFileSync(manifestPath, "utf8");
        if (isNullOrWhiteSpace(manifestString)) {
            handleValidationFailed({
                success: false,
                errorDetails: [{ message: `${MANIFEST_JSON} is empty.` }]
            });
            this._addOnManifest = undefined;
            return this._addOnManifest;
        }
        let parsedManifest;
        try {
            parsedManifest = JSON.parse(manifestString);
        }
        catch (error) {
            handleValidationFailed({
                success: false,
                errorDetails: [{ message: `JSON format error in ${MANIFEST_JSON}` }]
            });
            this._addOnManifest = undefined;
            return this._addOnManifest;
        }
        const privileged = this._isUserPrivileged ?? (await this._accountService.isUserPrivileged());
        const { manifest, manifestValidationResult } = AddOnManifest.createManifest({
            manifest: parsedManifest,
            additionalInfo: { ...ADDITIONAL_ADD_ON_INFO, privileged }
        });
        if (!manifestValidationResult.success) {
            handleValidationFailed(manifestValidationResult);
            this._addOnManifest = undefined;
            return undefined;
        }
        const errorDetails = [];
        const { entryPoints = [] } = manifest;
        entryPoints.forEach(entryPoint => {
            const entryPointPath = path.join(DEFAULT_OUTPUT_DIRECTORY, entryPoint.main);
            if (!fs.existsSync(entryPointPath) || !fs.lstatSync(entryPointPath).isFile()) {
                errorDetails.push({
                    message: format("Specified main in the {entryPointType}: {entryPointName} does not exist in {outputDirectory}.", {
                        entryPointType: entryPoint.type,
                        entryPointName: entryPoint.main,
                        outputDirectory: DEFAULT_OUTPUT_DIRECTORY
                    })
                });
            }
        });
        if (errorDetails.length > 0) {
            handleValidationFailed({
                success: false,
                errorDetails
            });
            this._addOnManifest = undefined;
            return undefined;
        }
        this._addOnManifest = manifest;
        return this._addOnManifest;
    }
};
AddOnManifestReader = __decorate([
    injectable(),
    __param(0, inject(IDeveloperTermsTypes.AccountService)),
    __metadata("design:paramtypes", [Object])
], AddOnManifestReader);
export { AddOnManifestReader };
//# sourceMappingURL=AddOnManifestReader.js.map