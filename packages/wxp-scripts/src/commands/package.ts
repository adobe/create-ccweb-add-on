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
import { DEFAULT_SRC_DIRECTORY, UncaughtExceptionHandler } from "@adobe/ccweb-add-on-core";
import type { Config } from "@oclif/core";
import { Flags } from "@oclif/core";
import type { BooleanFlag, CustomOptions, OptionFlag } from "@oclif/core/lib/interfaces/parser.js";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import type { CommandExecutor } from "../app/CommandExecutor.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";
import { PackageCommandOptions } from "../models/PackageCommandOptions.js";

/**
 * Package Command's implementation class.
 */
export class Package extends BaseCommand {
    private readonly _commandExecutor: CommandExecutor;

    static description = "Create a production build for the add-on and package it into a zip.";

    static args = {};

    static flags: {
        src: OptionFlag<string, CustomOptions>;
        use: OptionFlag<string, CustomOptions>;
        "no-rebuild": BooleanFlag<boolean>;
    } = {
        src: Flags.string({
            description: "Directory where the source code for the add-on is present.",
            required: false,
            default: DEFAULT_SRC_DIRECTORY
        }),
        use: Flags.string({
            description: "Transpiler to be used.",
            required: false,
            default: ""
        }),
        "no-rebuild": Flags.boolean({
            description: "Create a zip from the dist folder without rebuilding the add-on.",
            required: false,
            default: false
        })
    };

    constructor(argv: string[], config: Config) {
        super(argv, config, new CLIProgram(PROGRAM_NAME, config.name + "@" + config.version));

        this._commandExecutor = IContainer.getNamed<CommandExecutor>(ITypes.CommandExecutor, "package");
    }

    async run(): Promise<void> {
        // Add-on needs to be built in the production mode and then packaged.
        process.env.NODE_ENV = "production";

        UncaughtExceptionHandler.registerExceptionHandler(PROGRAM_NAME);

        const rootDirectory = process.cwd();
        process.chdir(rootDirectory);

        const { flags } = await this.parse(Package);

        await this._seekAnalyticsConsent(flags.analytics);

        const options = new PackageCommandOptions(flags.src, flags.use, !flags["no-rebuild"], flags.verbose);
        await this._commandExecutor.execute(options);
    }

    async catch(error: { message: string }): Promise<void> {
        this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_PACKAGE_COMMAND_ERROR, error.message, false);
        throw error;
    }
}
