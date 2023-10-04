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
import { DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
/**
 * Clean command executor.
 */
let CleanCommandExecutor = class CleanCommandExecutor {
    _scriptManager;
    _logger;
    _analyticsService;
    /**
     * Instantiate {@link CleanCommandExecutor}.
     *
     * @param scriptManager - {@link ScriptManager} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link CleanCommandExecutor} instance.
     * @param analyticsService - {@link AnalyticsService} reference.
     */
    constructor(scriptManager, logger, analyticsService) {
        this._scriptManager = scriptManager;
        this._logger = logger;
        this._analyticsService = analyticsService;
    }
    /**
     * Executes the command's handler.
     *
     * @returns Promise.
     */
    async execute() {
        this._logger.information(format(LOGS.cleaningOutputDirectory, { DEFAULT_OUTPUT_DIRECTORY }));
        await this._scriptManager.cleanDirectory(DEFAULT_OUTPUT_DIRECTORY);
        this._logger.success(LOGS.done, { postfix: LOGS.newLine });
        this._analyticsService.postEvent(AnalyticsSuccessMarkers.SCRIPTS_CLEAN_COMMAND_SUCCESS, LOGS.cleaningingSuccess, true);
    }
};
CleanCommandExecutor = __decorate([
    injectable(),
    __param(0, inject(ITypes.ScriptManager)),
    __param(1, inject(ICoreTypes.Logger)),
    __param(2, inject(IAnalyticsTypes.AnalyticsService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], CleanCommandExecutor);
export { CleanCommandExecutor };
const LOGS = {
    newLine: "\n",
    executeProgramExample: "{PROGRAM_NAME} build",
    cleaningOutputDirectory: "Cleaning output directory {DEFAULT_OUTPUT_DIRECTORY}/ ...",
    cleaningingSuccess: "Successfully cleaned output directory.",
    done: "Done."
};
//# sourceMappingURL=CleanCommandExecutor.js.map