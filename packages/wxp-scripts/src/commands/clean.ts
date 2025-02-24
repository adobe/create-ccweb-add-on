#!/usr/bin/env node

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

import type { AnalyticsConsent, AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { CLIProgram, ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import { UncaughtExceptionHandler } from "@adobe/ccweb-add-on-core";
import type { Config } from "@oclif/core";
import { Command, Flags } from "@oclif/core";
import process from "process";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import type { CommandExecutor } from "../app/CommandExecutor.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";

/**
 * Clean Command's implementation class.
 */
export class Clean extends Command {
    private readonly _analyticsConsent: AnalyticsConsent;
    private readonly _analyticsService: AnalyticsService;

    private readonly _commandExecutor: CommandExecutor;

    static description = "ccweb-add-on-scripts clean command used to clean the build output folder.";

    static args = {};

    static flags = {
        analytics: Flags.string({
            char: "a",
            description: "Turn on/off sending analytics to Adobe.",
            options: ["on", "off"],
            required: false
        })
    };

    constructor(argv: string[], config: Config) {
        super(argv, config);

        this._analyticsConsent = IContainer.get<AnalyticsConsent>(IAnalyticsTypes.AnalyticsConsent);

        this._analyticsService = IContainer.get<AnalyticsService>(IAnalyticsTypes.AnalyticsService);
        this._analyticsService.program = new CLIProgram(PROGRAM_NAME, this.config.version);
        this._analyticsService.startTime = Date.now();

        this._commandExecutor = IContainer.getNamed<CommandExecutor>(ITypes.CommandExecutor, "clean");
    }

    async run() {
        UncaughtExceptionHandler.registerExceptionHandler(PROGRAM_NAME);

        const rootDirectory = process.cwd();
        process.chdir(rootDirectory);

        const {
            flags: { analytics }
        } = await this.parse(Clean);

        await this._seekAnalyticsConsent(analytics);

        await this._commandExecutor.execute();
    }

    async catch(error: { message: string }) {
        this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_CLEAN_COMMAND_ERROR, error.message, false);
        throw error;
    }

    private async _seekAnalyticsConsent(analytics: string | undefined): Promise<void> {
        if (analytics === undefined) {
            await this._analyticsConsent.get();
        } else {
            await this._analyticsConsent.set(analytics === "on");
        }
    }
}
