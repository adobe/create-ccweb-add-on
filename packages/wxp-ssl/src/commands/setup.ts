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

import { BaseCommand, CLIProgram } from "@adobe/ccweb-add-on-analytics";
import { UncaughtExceptionHandler } from "@adobe/ccweb-add-on-core";
import type { Config } from "@oclif/core";
import { Flags } from "@oclif/core";
import type { BooleanFlag, CustomOptions, OptionFlag } from "@oclif/core/lib/interfaces/parser.js";
import process from "process";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import type { CommandExecutor } from "../app/CommandExecutor.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";
import { SetupCommandOptions } from "../models/SetupCommandOptions.js";
import type { CommandValidator } from "../validators/CommandValidator.js";

/**
 * SSL Setup command.
 */
export class Setup extends BaseCommand {
    private readonly _commandValidator: CommandValidator<SetupCommandOptions>;
    private readonly _commandExecutor: CommandExecutor<SetupCommandOptions>;

    static description = "Setup a locally trusted SSL certificate for hosting an add-on.";

    static args = {};

    static flags: {
        hostname: OptionFlag<string, CustomOptions>;
        useExisting: BooleanFlag<boolean>;
    } = {
        hostname: Flags.string({
            char: "h",
            description: "Hostname in the SSL certificate.",
            required: true
        }),
        useExisting: Flags.boolean({
            char: "e",
            description: "Use existing SSL if present.",
            required: false,
            default: false,
            hidden: true
        })
    };

    constructor(argv: string[], config: Config) {
        super(argv, config, new CLIProgram(PROGRAM_NAME, config.name + "@" + config.version));

        this._commandValidator = IContainer.getNamed<CommandValidator<SetupCommandOptions>>(
            ITypes.CommandValidator,
            "setup"
        );
        this._commandExecutor = IContainer.getNamed<CommandExecutor<SetupCommandOptions>>(
            ITypes.CommandExecutor,
            "setup"
        );
    }

    async run(): Promise<void> {
        UncaughtExceptionHandler.registerExceptionHandler(PROGRAM_NAME);

        const rootDirectory = process.cwd();
        process.chdir(rootDirectory);

        const {
            flags: { hostname, useExisting, analytics, verbose }
        } = await this.parse(Setup);

        await this._seekAnalyticsConsent(analytics);

        const options = new SetupCommandOptions(hostname, useExisting, verbose);
        await this._commandValidator.validate(options);
        await this._commandExecutor.execute(options);
    }

    async catch(error: { message: string }): Promise<void> {
        void this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_SSL_SETUP, error.message, false);
        throw error;
    }
}
