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
import {
    BaseCommand,
    DEFAULT_HOST_NAME,
    DEFAULT_PORT,
    DEFAULT_SRC_DIRECTORY,
    UncaughtExceptionHandler
} from "@adobe/ccweb-add-on-core";
import type { Config } from "@oclif/core";
import { Flags } from "@oclif/core";
import type { CustomOptions, OptionFlag } from "@oclif/core/lib/interfaces/parser.js";
import type { Express } from "express";
import process from "process";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import type { CommandExecutor } from "../app/CommandExecutor.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";
import { StartCommandOptions } from "../models/StartCommandOptions.js";
import type { CommandValidator } from "../validators/CommandValidator.js";

/**
 * Start Command's implementation class.
 */
export class Start extends BaseCommand {
    private readonly _analyticsConsent: AnalyticsConsent;
    private readonly _analyticsService: AnalyticsService;

    private readonly _expressApp: Express;
    private readonly _commandValidator: CommandValidator;
    private readonly _commandExecutor: CommandExecutor;

    static description = "Host the built source folder.";

    static args = {};

    static flags: {
        src: OptionFlag<string, CustomOptions>;
        use: OptionFlag<string, CustomOptions>;
        hostname: OptionFlag<string, CustomOptions>;
        port: OptionFlag<string, CustomOptions>;
    } = {
        src: Flags.string({
            description: "Directory where the source code of the Add-on is present.",
            required: false,
            default: DEFAULT_SRC_DIRECTORY
        }),
        use: Flags.string({
            description: "Transpiler to use.",
            required: false,
            default: ""
        }),
        hostname: Flags.string({
            description: "Local development server hostname.",
            required: false,
            default: DEFAULT_HOST_NAME
        }),
        port: Flags.string({
            description: "Local development server port.",
            required: false,
            default: DEFAULT_PORT
        })
    };

    constructor(argv: string[], config: Config) {
        super(argv, config);

        this._analyticsConsent = IContainer.get<AnalyticsConsent>(IAnalyticsTypes.AnalyticsConsent);

        this._analyticsService = IContainer.get<AnalyticsService>(IAnalyticsTypes.AnalyticsService);
        this._analyticsService.program = new CLIProgram(PROGRAM_NAME, this.config.name + "@" + this.config.version);
        this._analyticsService.startTime = Date.now();

        this._expressApp = IContainer.get<Express>(ITypes.ExpressApp);

        this._commandValidator = IContainer.getNamed<CommandValidator>(ITypes.CommandValidator, "start");
        this._commandExecutor = IContainer.getNamed<CommandExecutor>(ITypes.CommandExecutor, "start");
    }

    async run(): Promise<void> {
        UncaughtExceptionHandler.registerExceptionHandler(PROGRAM_NAME);

        const rootDirectory = process.cwd();
        process.chdir(rootDirectory);

        const {
            flags: { src, use, hostname, port, analytics, verbose }
        } = await this.parse(Start);

        await this._seekAnalyticsConsent(analytics);

        const options = new StartCommandOptions(src, use, hostname, parseInt(port), verbose);
        await this._commandValidator.validate(options);
        await this._commandExecutor.execute(options, this._expressApp);
    }

    async catch(error: { message: string }): Promise<void> {
        this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_START_COMMAND_ERROR, error.message, false);
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
