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
import { SetupCommandOptions } from "../models/SetupCommandOptions.js";
import type { CommandValidator } from "../validators/CommandValidator.js";

/**
 * SSL Setup command.
 */
export class Setup extends Command {
    private readonly _analyticsConsent: AnalyticsConsent;
    private readonly _analyticsService: AnalyticsService;

    private readonly _commandValidator: CommandValidator;
    private readonly _commandExecutor: CommandExecutor;

    static description = "Setup a trusted SSL certificate for hosting an add-on.";

    static args = {};

    static flags = {
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
        }),
        analytics: Flags.string({
            char: "a",
            description: "Turn on/off sending analytics to Adobe.",
            options: ["on", "off"],
            required: false
        }),
        verbose: Flags.boolean({
            char: "v",
            description: "Print detailed logs.",
            required: false,
            default: false
        })
    };

    constructor(argv: string[], config: Config) {
        super(argv, config);

        this._analyticsConsent = IContainer.get<AnalyticsConsent>(IAnalyticsTypes.AnalyticsConsent);

        this._analyticsService = IContainer.get<AnalyticsService>(IAnalyticsTypes.AnalyticsService);
        this._analyticsService.program = new CLIProgram(PROGRAM_NAME, this.config.name + "@" + this.config.version);
        this._analyticsService.startTime = Date.now();

        this._commandValidator = IContainer.getNamed<CommandValidator>(ITypes.CommandValidator, "setup");
        this._commandExecutor = IContainer.getNamed<CommandExecutor>(ITypes.CommandExecutor, "setup");
    }

    async run() {
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

    async catch(error: { message: string }) {
        this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_SSL_SETUP, error.message, false);
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
