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
import { __decorate, __metadata, __param } from "tslib";
import { ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import chalk from "chalk";
import { inject, injectable } from "inversify";
import prompts from "prompts";
import "reflect-metadata";
/**
 * Implementation class to get and set user's consent
 * on allowing the application to collect and send analytics to Adobe.
 */
let WxpAnalyticsConsent = class WxpAnalyticsConsent {
    _preferences;
    _logger;
    /**
     * Instantiate {@link WxpAnalyticsConsent}.
     * @param preferences - {@link Preferences} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link WxpAnalyticsConsent} instance.
     */
    constructor(preferences, logger) {
        this._preferences = preferences;
        this._logger = logger;
    }
    /**
     * Get user consent to collect and send analytics to Adobe.
     * @returns Promise of boolean value representing whether the user has provided consent.
     */
    async get() {
        // Always get the preference from cache
        // for checking the analytics consent
        // to avoid a file IO operation.
        const preferenceData = this._preferences.get(true);
        if (preferenceData.hasTelemetryConsent !== undefined) {
            return preferenceData.hasTelemetryConsent;
        }
        this._logger.warning(LOGS.toolCollectsAnalytics, { prefix: LOGS.newLine });
        const choices = [
            {
                title: this._promptMessageOption(LOGS.yesSendAnalytics),
                value: true
            },
            {
                title: this._promptMessageOption(LOGS.noDontSendAnalytics),
                value: false
            }
        ];
        const response = await prompts.prompt({
            type: "select",
            name: "analyticsConsent",
            message: this._promptMessage(LOGS.sendToAdobe),
            choices,
            initial: 0
        });
        if (!response || response.analyticsConsent === undefined) {
            return process.exit(0);
        }
        await this.set(response.analyticsConsent);
        return response.analyticsConsent;
    }
    /**
     * Set user consent to collect and send analytics to Adobe.
     * @param consent - Boolean value representing whether the user has provided consent.
     */
    async set(consent) {
        const preferenceData = this._preferences.get();
        preferenceData.hasTelemetryConsent = consent;
        this._preferences.set(preferenceData);
    }
    _promptMessage(message) {
        return chalk.hex("#E59400")(message);
    }
    _promptMessageOption(message) {
        return chalk.green.bold(message);
    }
};
WxpAnalyticsConsent = __decorate([
    injectable(),
    __param(0, inject(ICoreTypes.Preferences)),
    __param(1, inject(ICoreTypes.Logger)),
    __metadata("design:paramtypes", [Object, Object])
], WxpAnalyticsConsent);
export { WxpAnalyticsConsent };
const LOGS = {
    newLine: "\n",
    yesSendAnalytics: "Yes, send analytics to Adobe",
    noDontSendAnalytics: "No, don't send analytics to Adobe",
    toolCollectsAnalytics: "This tool collects and sends analytics to help Adobe improve its products.",
    sendToAdobe: "Do you want to allow sending analytics to Adobe"
};
//# sourceMappingURL=WxpAnalyticsConsent.js.map