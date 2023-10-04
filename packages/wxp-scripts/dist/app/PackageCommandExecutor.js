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
import { DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import { inject, injectable, named } from "inversify";
import path from "path";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import { ITypes } from "../config/inversify.types.js";
import { PackageManager } from "../utilities/PackageManager.js";
/**
 * Package command executor.
 */
let PackageCommandExecutor = class PackageCommandExecutor {
    _buildCommandExecutor;
    _logger;
    _manifestReader;
    /**
     * Instantiate {@link PackageCommandExecutor}.
     *
     * @param buildCommandExecutor - {@link CommandExecutor} reference.
     * @param logger - {@link Logger} reference.
     * @param manifestReader - {@link AddOnManifestReader} reference.
     * @returns Reference to a new {@link PackageCommandExecutor} instance.
     */
    constructor(buildCommandExecutor, logger, manifestReader) {
        this._buildCommandExecutor = buildCommandExecutor;
        this._logger = logger;
        this._manifestReader = manifestReader;
    }
    /**
     * Creates a package of the dist folder.
     *
     * @param options - {@link PackageCommandOptions}.
     * @returns Promise.
     */
    async execute(options) {
        if (options.shouldRebuild) {
            const isBuildSuccessful = await this._buildCommandExecutor.execute(options);
            if (!isBuildSuccessful) {
                return;
            }
        }
        else {
            await this._manifestReader.getManifest(this._onValidationFailed, options.shouldRebuild);
        }
        await this._packageContent();
    }
    _onValidationFailed = (failedResult) => {
        this._logger.error(LOGS.manifestValidationFailed);
        const { errorDetails } = failedResult;
        if (errorDetails !== undefined && errorDetails.length > 0) {
            errorDetails.forEach((manifestError) => {
                if (!isNullOrWhiteSpace(manifestError?.message)) {
                    this._logger.error(`${!isNullOrWhiteSpace(manifestError?.instancePath) ? `${manifestError.instancePath} - ` : ""}${manifestError.message}`);
                }
            });
            console.log();
            process.exit(1);
        }
    };
    async _packageContent() {
        try {
            this._logger.information(format(LOGS.creatingZip, {
                outputDirectory: DEFAULT_OUTPUT_DIRECTORY
            }));
            const packageGenerator = PackageManager.generatePackageManager();
            const zipFilePath = path.join(process.cwd(), `${DEFAULT_OUTPUT_DIRECTORY}.zip`);
            packageGenerator.addLocalFolder(path.resolve(DEFAULT_OUTPUT_DIRECTORY), "", PackageManager.filterOSFiles);
            packageGenerator.writeZip(zipFilePath);
            this._logger.success(LOGS.done, { postfix: LOGS.newLine });
        }
        catch (error) {
            this._logger.error(format(LOGS.somethingWentWrong, {
                outputDirectory: DEFAULT_OUTPUT_DIRECTORY
            }));
        }
    }
};
PackageCommandExecutor = __decorate([
    injectable(),
    __param(0, inject(ITypes.CommandExecutor)),
    __param(0, named("build")),
    __param(1, inject(ICoreTypes.Logger)),
    __param(2, inject(ITypes.AddOnManifestReader)),
    __metadata("design:paramtypes", [Object, Object, Function])
], PackageCommandExecutor);
export { PackageCommandExecutor };
const LOGS = {
    newLine: "\n",
    creatingZip: "Creating a zip from {outputDirectory}/ ...",
    done: "Done.",
    somethingWentWrong: "Something went wrong while creating a zip from {outputDirectory}.",
    manifestValidationFailed: "Add-on manifest validation failed.",
    entryPointMainNotFound: "Specified main in the {entryPointType}: {entryPointName} does not exist in {outputDirectory}."
};
//# sourceMappingURL=PackageCommandExecutor.js.map