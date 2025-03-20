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

import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import type { Logger, Preferences } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import devcert from "@adobe/ccweb-add-on-devcert";
import chalk from "chalk";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import prompts from "prompts";
import "reflect-metadata";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { SSLRemoveOption } from "../models/Types.js";
import type { CommandExecutor } from "./CommandExecutor.js";

/**
 * Purge command execution implementation class.
 */
@injectable()
export class PurgeCommandExecutor implements CommandExecutor {
    private readonly _preferences: Preferences;
    private readonly _analyticsService: AnalyticsService;
    private readonly _logger: Logger;

    /**
     * Instantiate {@link PurgeCommandExecutor}.
     * @param preferences - {@link Preferences} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link PurgeCommandExecutor} instance.
     */
    constructor(
        @inject(ICoreTypes.Preferences) preferences: Preferences,
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService,
        @inject(ICoreTypes.Logger) logger: Logger
    ) {
        this._preferences = preferences;
        this._analyticsService = analyticsService;
        this._logger = logger;
    }

    /**
     * Purge all SSL artifacts and invalidate the certificate authority from the trusted source.
     * @returns Promise.
     */
    async execute(): Promise<void> {
        const response = await prompts.prompt({
            type: "select",
            name: "purgeConfirmation",
            message: this._promptMessage(LOGS.purgeConfirmation),
            choices: [
                { title: this._promptMessageOption(LOGS.keepSSL), value: SSLRemoveOption.Keep },
                { title: this._promptMessageOption(LOGS.removeSSL), value: SSLRemoveOption.Remove }
            ],
            initial: 0
        });

        if (!response || !response.purgeConfirmation) {
            this._analyticsService.postEvent(
                AnalyticsErrorMarkers.ERROR_SSL_PURGE,
                LOGS.sslPurgeOptionNotSpecified,
                false
            );

            return;
        }

        if (response.purgeConfirmation === SSLRemoveOption.Keep) {
            return;
        }

        this._logger.information(LOGS.removingAndInvalidatingSSL, { prefix: LOGS.newLine });
        this._logger.message(LOGS.requireSystemPassword);
        this._logger.message(LOGS.requireSystemPasswordReason);
        this._logger.message(LOGS.retryRunningIfTakingLonger);

        this._purgeCustomSSL();
        this._purgeWxpSSL();

        this._logger.success(LOGS.removedAllSSL, { prefix: LOGS.newLine, postfix: LOGS.newLine });
    }

    private _purgeCustomSSL(): void {
        const userPreference = this._preferences.get();
        if (userPreference.ssl !== undefined) {
            userPreference.ssl = undefined;
            this._preferences.set(userPreference);
        }

        this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_MANUAL_PURGE, "", true);
    }

    private _purgeWxpSSL(): void {
        if (fs.existsSync(devcert.location())) {
            devcert.removeAll();
            this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_AUTOMATIC_PURGE, "", true);
        }
    }

    private _promptMessage(message: string): string {
        return chalk.hex("#E59400")(message);
    }

    private _promptMessageOption(message: string): string {
        return chalk.green.bold(message);
    }
}

const LOGS = {
    newLine: "\n",
    sslPurgeOptionNotSpecified: "SSL purge option is not specified.",
    purgeConfirmation: "Are you sure you want to remove all SSL artifacts from your system",
    keepSSL: "No, keep existing SSL artifacts",
    removeSSL: "Yes, remove all SSL artifacts",
    removingAndInvalidatingSSL: "Removing and invalidating all SSL artifacts from your system ...",
    requireSystemPassword: "This may require you to enter your system's password,",
    requireSystemPasswordReason:
        "so that the SSL certificate can be removed from your system's trusted certificate path.",
    retryRunningIfTakingLonger: "[If this takes longer than expected, please break and retry]",
    removedAllSSL: "Removed all SSL artifacts."
};
