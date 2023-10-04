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
import { CLIProgram, ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import { DEFAULT_SRC_DIRECTORY, UncaughtExceptionHandler } from "@adobe/ccweb-add-on-core";
import { Command, Flags } from "@oclif/core";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";
import { PackageCommandOptions } from "../models/PackageCommandOptions.js";
/**
 * Package Command's implementation class.
 */
export class Package extends Command {
    _analyticsConsent;
    _analyticsService;
    _commandExecutor;
    static description = "ccweb-add-on-scripts package command is used to create a production build for the add-on and package it into a zip.";
    static args = {};
    static flags = {
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
        }),
        analytics: Flags.string({
            char: "a",
            description: "Turn on/off sending analytics to Adobe.",
            options: ["on", "off"],
            required: false
        }),
        verbose: Flags.boolean({
            char: "v",
            description: "Print detailed messages.",
            required: false,
            default: false
        })
    };
    constructor(argv, config) {
        super(argv, config);
        this._analyticsConsent = IContainer.get(IAnalyticsTypes.AnalyticsConsent);
        this._analyticsService = IContainer.get(IAnalyticsTypes.AnalyticsService);
        this._analyticsService.program = new CLIProgram(PROGRAM_NAME, this.config.name + "@" + this.config.version);
        this._analyticsService.startTime = Date.now();
        this._commandExecutor = IContainer.getNamed(ITypes.CommandExecutor, "package");
    }
    async run() {
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
    async catch(error) {
        this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_PACKAGE_COMMAND_ERROR, error.message, false);
        throw error;
    }
    async _seekAnalyticsConsent(analytics) {
        if (analytics === undefined) {
            await this._analyticsConsent.get();
        }
        else {
            await this._analyticsConsent.set(analytics === "on");
        }
    }
}
//# sourceMappingURL=package.js.map