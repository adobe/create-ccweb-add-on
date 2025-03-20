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
import { BaseCommand, UncaughtExceptionHandler } from "@adobe/ccweb-add-on-core";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import type { Config } from "@oclif/core";
import { Args, Flags } from "@oclif/core";
import { Arg, CustomOptions, OptionFlag } from "@oclif/core/lib/interfaces/parser.js";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import type { AddOnFactory } from "../app/AddOnFactory.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";
import { CLIOptions } from "../models/CLIOptions.js";

/**
 * Implementation class of the create-ccweb-add-on command.
 */
export class Create extends BaseCommand {
    private readonly _analyticsConsent: AnalyticsConsent;
    private readonly _analyticsService: AnalyticsService;

    private readonly _addOnFactory: AddOnFactory;

    static description = "Create an Adobe Creative Cloud Web Add-on.";

    static examples: string[] = ["create-ccweb-add-on <add-on-name> --template <javascript>"];

    static flags: {
        entrypoint: OptionFlag<string, CustomOptions>;
        template: OptionFlag<string, CustomOptions>;
    } = {
        entrypoint: Flags.string({
            char: "e",
            description: "Entrypoint type of Add-on (By default it is set as 'panel').",
            default: EntrypointType.PANEL,
            required: false,
            hidden: true
        }),
        template: Flags.string({
            char: "t",
            description: "Template to use for creating the Add-on project.",
            default: "",
            required: false
        })
    };

    static args: {
        name: Arg<string, Record<string, unknown>>;
    } = {
        name: Args.string({
            name: "name",
            description: "Name of the Add-on project.",
            required: true
        })
    };

    constructor(argv: string[], config: Config) {
        super(argv, config);

        this._analyticsConsent = IContainer.get<AnalyticsConsent>(IAnalyticsTypes.AnalyticsConsent);

        this._analyticsService = IContainer.get<AnalyticsService>(IAnalyticsTypes.AnalyticsService);
        this._analyticsService.program = new CLIProgram(PROGRAM_NAME, this.config.name + "@" + this.config.version);
        this._analyticsService.startTime = Date.now();

        this._addOnFactory = IContainer.get<AddOnFactory>(ITypes.AddOnFactory);
    }

    async run(): Promise<void> {
        UncaughtExceptionHandler.registerExceptionHandler(PROGRAM_NAME);

        const {
            args: { name },
            flags: { entrypoint, template, analytics, verbose }
        } = await this.parse(Create);

        await this._seekAnalyticsConsent(analytics);

        console.log();

        const options = new CLIOptions(
            entrypoint.toLowerCase() as EntrypointType,
            name,
            template.toLowerCase(),
            verbose
        );

        await this._addOnFactory.create(options);
    }

    async catch(error: { message: string }): Promise<void> {
        await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_INVALID_ARGS, error.message, false);
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
