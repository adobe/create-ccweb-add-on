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

import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import type { Logger } from "@adobe/ccweb-add-on-core";
import { DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import type { CommandExecutor } from "./CommandExecutor.js";
import type { ScriptManager } from "./ScriptManager.js";

/**
 * Clean command executor.
 */
@injectable()
export class CleanCommandExecutor implements CommandExecutor {
    private readonly _scriptManager: ScriptManager;
    private readonly _logger: Logger;
    private readonly _analyticsService: AnalyticsService;

    /**
     * Instantiate {@link CleanCommandExecutor}.
     *
     * @param scriptManager - {@link ScriptManager} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link CleanCommandExecutor} instance.
     * @param analyticsService - {@link AnalyticsService} reference.
     */
    constructor(
        @inject(ITypes.ScriptManager) scriptManager: ScriptManager,
        @inject(ICoreTypes.Logger) logger: Logger,
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService
    ) {
        this._scriptManager = scriptManager;
        this._logger = logger;
        this._analyticsService = analyticsService;
    }

    /**
     * Executes the command's handler.
     *
     * @returns Promise.
     */
    async execute(): Promise<void> {
        this._logger.information(format(LOGS.cleaningOutputDirectory, { DEFAULT_OUTPUT_DIRECTORY }));
        await this._scriptManager.cleanDirectory(DEFAULT_OUTPUT_DIRECTORY);
        this._logger.success(LOGS.done, { postfix: LOGS.newLine });

        this._analyticsService.postEvent(
            AnalyticsSuccessMarkers.SCRIPTS_CLEAN_COMMAND_SUCCESS,
            LOGS.cleaningingSuccess,
            true
        );
    }
}

const LOGS = {
    newLine: "\n",
    cleaningOutputDirectory: "Cleaning output directory {DEFAULT_OUTPUT_DIRECTORY}/ ...",
    cleaningingSuccess: "Successfully cleaned output directory.",
    done: "Done."
};
