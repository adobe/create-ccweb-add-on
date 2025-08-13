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

import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import type { Logger } from "@adobe/ccweb-add-on-core";
import { ALLOWED_HOSTNAMES, DEFAULT_HOST_NAME, ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import { inject, injectable } from "inversify";
import isValidDomain from "is-valid-domain";
import process from "process";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import type { StartCommandOptions } from "../models/StartCommandOptions.js";
import type { CommandValidator } from "./CommandValidator.js";

/**
 * Start command validator implementation class.
 */
@injectable()
export class StartCommandValidator implements CommandValidator<StartCommandOptions> {
    private readonly _analyticsService: AnalyticsService;
    private readonly _logger: Logger;

    /**
     * Instantiate {@link StartCommandValidator}.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link StartCommandValidator} instance.
     */
    constructor(
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService,
        @inject(ICoreTypes.Logger) logger: Logger
    ) {
        this._analyticsService = analyticsService;
        this._logger = logger;
    }

    /**
     * Validate start command options.
     * @param options - Start command arguments provided by user.
     * @returns - Promise.
     */
    async validate(options: StartCommandOptions): Promise<void> {
        await this._validateHostname(options);
        await this._validatePort(options);
    }

    private async _validateHostname(options: StartCommandOptions) {
        const eventData = ["--use", options.transpiler, "--hostname", options.hostname, "--port", options.port];

        const isHostnameAllowed =
            options.hostname === DEFAULT_HOST_NAME ||
            (isValidDomain(options.hostname) && ALLOWED_HOSTNAMES.test(options.hostname));

        if (!isHostnameAllowed) {
            this._logger.error(LOGS.invalidHostname, { postfix: LOGS.newLine });

            await void this._analyticsService.postEvent(
                AnalyticsErrorMarkers.SCRIPTS_START_INVALID_HOSTNAME_ERROR,
                eventData.join(" "),
                false
            );

            return process.exit(1);
        }
    }

    private async _validatePort(options: StartCommandOptions) {
        if (!isNaN(options.port) && options.port >= 80 && options.port <= 65535) {
            return;
        }

        this._logger.error(LOGS.invalidPort, { postfix: LOGS.newLine });

        const eventData = ["--use", options.transpiler, "--hostname", options.hostname, "--port", options.port];
        await void this._analyticsService.postEvent(
            AnalyticsErrorMarkers.SCRIPTS_START_INVALID_PORT_ERROR,
            eventData.join(" "),
            false
        );

        return process.exit(1);
    }
}

const LOGS = {
    newLine: "\n",
    invalidHostname: "Invalid hostname. Only 'localhost' and '*.adobe.com' are allowed.",
    invalidPort: "Invalid port. Please provide a value between 80 and 65535."
};
