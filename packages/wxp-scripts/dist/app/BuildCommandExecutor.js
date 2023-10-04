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
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import { DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import { inject, injectable, named } from "inversify";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import { AddOnDirectory } from "../models/index.js";
/**
 * Build command executor.
 */
let BuildCommandExecutor = class BuildCommandExecutor {
    _scriptManager;
    _logger;
    _cleanCommandExecutor;
    _manifestReader;
    _analyticsService;
    /**
     * Instantiate {@link BuildCommandExecutor}.
     * @param scriptManager - {@link ScriptManager} reference.
     * @param logger - {@link Logger} reference.
     * @param cleanCommandExecutor - {@link CommandExecutor} reference.
     * @param manifestReader - {@link AddOnManifestReader} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link BuildCommandExecutor} instance.
     */
    constructor(scriptManager, logger, cleanCommandExecutor, manifestReader, analyticsService) {
        this._scriptManager = scriptManager;
        this._logger = logger;
        this._cleanCommandExecutor = cleanCommandExecutor;
        this._manifestReader = manifestReader;
        this._analyticsService = analyticsService;
    }
    /**
     * Executes the command's handler.
     *
     * @param options - {@link BuildCommandOptions}.
     * @returns Promise.
     */
    async execute(options) {
        await this._cleanCommandExecutor.execute();
        return this._build(options);
    }
    _onValidationFailed = async (failedResult) => {
        this._logger.error(LOGS.manifestValidationFailed);
        const { errorDetails } = failedResult;
        if (errorDetails !== undefined && errorDetails.length > 0) {
            errorDetails.forEach((manifestError) => {
                if (!isNullOrWhiteSpace(manifestError?.message)) {
                    this._logger.error(`${!isNullOrWhiteSpace(manifestError?.instancePath) ? `${manifestError.instancePath} - ` : ""}${manifestError.message}`);
                }
            });
            this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR, LOGS.manifestValidationFailed, false);
        }
        console.log();
        process.exit(1);
    };
    async _build(options) {
        this._logger.information(format(LOGS.buildingSourceDirectory, {
            srcDirectory: options.srcDirectory,
            DEFAULT_OUTPUT_DIRECTORY
        }));
        let isBuildSuccessful = true;
        if (!isNullOrWhiteSpace(options.transpiler)) {
            isBuildSuccessful = await this._scriptManager.transpile(options.transpiler);
        }
        else {
            await this._scriptManager.copyStaticFiles(options.srcDirectory, DEFAULT_OUTPUT_DIRECTORY);
        }
        const addOnManifest = (await this._manifestReader.getManifest(this._onValidationFailed, false));
        const addOnDirectory = new AddOnDirectory(options.srcDirectory, addOnManifest);
        if (isBuildSuccessful) {
            this._logger.success(LOGS.done, { postfix: LOGS.newLine });
            const analyticsEventData = [
                "--addOnName",
                addOnDirectory.rootDirName,
                "--testId",
                addOnManifest.manifestProperties.testId,
                "--manifestVersion",
                addOnManifest.manifestProperties.manifestVersion,
                "--use",
                options.transpiler
            ];
            this._analyticsService.postEvent(AnalyticsSuccessMarkers.SCRIPTS_BUILD_COMMAND_SUCCESS, analyticsEventData.join(" "), true);
        }
        else {
            this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR, LOGS.buildFailed, false);
        }
        return isBuildSuccessful;
    }
};
BuildCommandExecutor = __decorate([
    injectable(),
    __param(0, inject(ITypes.ScriptManager)),
    __param(1, inject(ICoreTypes.Logger)),
    __param(2, inject(ITypes.CommandExecutor)),
    __param(2, named("clean")),
    __param(3, inject(ITypes.AddOnManifestReader)),
    __param(4, inject(IAnalyticsTypes.AnalyticsService)),
    __metadata("design:paramtypes", [Object, Object, Object, Function, Object])
], BuildCommandExecutor);
export { BuildCommandExecutor };
const LOGS = {
    newLine: "\n",
    buildingSourceDirectory: "Building source directory {srcDirectory}/ to {DEFAULT_OUTPUT_DIRECTORY}/ ...",
    done: "Done.",
    manifestValidationFailed: "Add-on manifest validation failed.",
    buildFailed: "Build Generation Failed."
};
//# sourceMappingURL=BuildCommandExecutor.js.map