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

import { Command, Config, Flags } from "@oclif/core";
import { BooleanFlag, CustomOptions, OptionFlag } from "@oclif/core/lib/interfaces/parser.js";
import { AnalyticsConsent } from "../app/AnalyticsConsent.js";
import { AnalyticsService } from "../app/AnalyticsService.js";
import { IContainer, ITypes } from "../config/index.js";
import { CLIProgram } from "../models/index.js";

export abstract class BaseCommand extends Command {
    protected readonly _analyticsConsent: AnalyticsConsent;
    protected readonly _analyticsService: AnalyticsService;

    constructor(argv: string[], config: Config, program: CLIProgram) {
        super(argv, config);

        this._analyticsConsent = IContainer.get<AnalyticsConsent>(ITypes.AnalyticsConsent);

        this._analyticsService = IContainer.get<AnalyticsService>(ITypes.AnalyticsService);
        this._analyticsService.program = program;
        this._analyticsService.startTime = Date.now();
    }

    static baseFlags: {
        analytics: OptionFlag<string | undefined, CustomOptions>;
        verbose: BooleanFlag<boolean>;
    } = {
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

    protected async _seekAnalyticsConsent(analytics: string | undefined): Promise<void> {
        if (analytics === undefined) {
            await this._analyticsConsent.get();
        } else {
            await this._analyticsConsent.set(analytics === "on");
        }
    }
}
