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
import { UncaughtExceptionHandler } from "@adobe/ccweb-add-on-core";
import { ITypes as IDeveloperTermsTypes } from "@adobe/ccweb-add-on-developer-terms";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { Args, Command, Flags } from "@oclif/core";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import { IContainer, ITypes } from "../config/index.js";
import { PROGRAM_NAME } from "../constants.js";
import { CLIOptions } from "../models/CLIOptions.js";
/**
 * Implementation class of the create-ccweb-add-on command.
 */
export class CreateCCWebAddOn extends Command {
    _accountService;
    _analyticsConsent;
    _analyticsService;
    _addOnFactory;
    static description = "Create an Adobe Creative Cloud Web Add-on.";
    static examples = ["create-ccweb-add-on <add-on-name> --template <javascript>"];
    static flags = {
        kind: Flags.string({
            char: "k",
            description: "Kind of Add-on (panel).",
            default: EntrypointType.PANEL,
            required: false,
            hidden: true
        }),
        template: Flags.string({
            char: "t",
            description: "Template to use for creating the Add-on project.",
            default: "",
            required: false
        }),
        login: Flags.boolean({
            char: "l",
            description: "To force login",
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
            description: "Enable verbose logging.",
            default: false,
            required: false
        })
    };
    static args = {
        addOnName: Args.string({
            name: "addOnName",
            description: "Name of the Add-on project.",
            required: true
        })
    };
    constructor(argv, config) {
        super(argv, config);
        this._accountService = IContainer.get(IDeveloperTermsTypes.AccountService);
        this._analyticsConsent = IContainer.get(IAnalyticsTypes.AnalyticsConsent);
        this._analyticsService = IContainer.get(IAnalyticsTypes.AnalyticsService);
        this._analyticsService.program = new CLIProgram(PROGRAM_NAME, this.config.name + "@" + this.config.version);
        this._analyticsService.startTime = Date.now();
        this._addOnFactory = IContainer.get(ITypes.AddOnFactory);
    }
    async run() {
        UncaughtExceptionHandler.registerExceptionHandler(PROGRAM_NAME);
        const { args: { addOnName }, flags: { kind, template, login, analytics, verbose } } = await this.parse(CreateCCWebAddOn);
        await this._seekTermsOfUseConsent(login, verbose);
        await this._seekAnalyticsConsent(analytics);
        console.log();
        const options = new CLIOptions(kind.toLowerCase(), addOnName, template.toLowerCase(), verbose);
        await this._addOnFactory.create(options);
    }
    async catch(error) {
        await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_INVALID_ARGS, error.message, false);
        throw error;
    }
    async _seekTermsOfUseConsent(login, verbose) {
        if (login) {
            await this._accountService.invalidateToken(verbose);
        }
        await this._accountService.seekTermsOfUseConsent();
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
//# sourceMappingURL=create.js.map