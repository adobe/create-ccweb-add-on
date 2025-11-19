/********************************************************************************
 * MIT License

 * © Copyright 2025 Adobe. All rights reserved.

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

import { BaseCommand, CLIProgram } from "@adobe/ccweb-add-on-analytics";
import { UncaughtExceptionHandler } from "@adobe/ccweb-add-on-core";
import type { Config } from "@oclif/core";
import process from "process";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import type { CommandExecutor } from "../app/CommandExecutor.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";

/**
 * SSL Purge command.
 */
export class Purge extends BaseCommand {
    private readonly _commandExecutor: CommandExecutor;

    static description = "Remove and invalidate all add-on related SSL artifacts from your system.";

    static args = {};

    static flags = {};

    constructor(argv: string[], config: Config) {
        super(argv, config, new CLIProgram(PROGRAM_NAME, config.name + "@" + config.version));

        this._commandExecutor = IContainer.getNamed<CommandExecutor>(ITypes.CommandExecutor, "purge");
    }

    async run(): Promise<void> {
        UncaughtExceptionHandler.registerExceptionHandler(PROGRAM_NAME);

        const rootDirectory = process.cwd();
        process.chdir(rootDirectory);

        const {
            flags: { analytics }
        } = (await this.parse(Purge)) as { flags: { analytics: string } };

        await this._seekAnalyticsConsent(analytics);

        await this._commandExecutor.execute();
    }

    async catch(error: { message: string }): Promise<void> {
        void this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_SSL_PURGE, error.message, false);
        throw error;
    }
}
