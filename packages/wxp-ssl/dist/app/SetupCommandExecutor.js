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
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import { ITypes as ICoreTypes, isFile } from "@adobe/ccweb-add-on-core";
import chalk from "chalk";
import devcert from "@adobe/ccweb-add-on-devcert";
import { inject, injectable } from "inversify";
import path from "path";
import process from "process";
import prompts from "prompts";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import { SSLRemoveOption, SSLSetupOption } from "../models/Types.js";
const MAX_PROMPT_RETRIES = 3;
/**
 * Setup command execution implementation class.
 */
let SetupCommandExecutor = class SetupCommandExecutor {
    _preferences;
    _sslReader;
    _analyticsService;
    _logger;
    /**
     * Instantiate {@link SetupCommandExecutor}.
     * @param preferences - {@link Preferences} reference.
     * @param sslReader - {@link SSLReader} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link SetupCommandExecutor} instance.
     */
    constructor(preferences, sslReader, analyticsService, logger) {
        this._preferences = preferences;
        this._sslReader = sslReader;
        this._analyticsService = analyticsService;
        this._logger = logger;
    }
    /**
     * Setup self-signed SSL certificate and key by checking if user defined preferences
     * have SSL config data or if the user has already setup the certificates last time.
     * Otherwise prompt the user to setup the SSL themselves by providing paths as the input or
     * by allowing the CLI to setup the certificates on user's behalf.
     * @param options - Command arguments provided by user represented as {@link SetupCommandOptions}.
     * @returns Promise.
     */
    async execute(options) {
        if (!(await this._shouldSetupNewSSL(options))) {
            return;
        }
        const response = await prompts.prompt({
            type: "select",
            name: "sslSetupType",
            message: this._promptMessage(LOGS.setupSSL),
            choices: [
                { title: this._promptMessageOption(LOGS.automatically), value: SSLSetupOption.Automatically },
                { title: this._promptMessageOption(LOGS.manually), value: SSLSetupOption.Manually }
            ],
            initial: 0
        });
        if (!response || !response.sslSetupType) {
            this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_SSL_SETUP, LOGS.sslSetupOptionNotSpecified, false);
            return process.exit(1);
        }
        if (response.sslSetupType === SSLSetupOption.Manually) {
            await this._setupSSLManually(options.hostname);
            this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_MANUAL_SETUP, options.hostname, true);
        }
        else {
            await this._setupSSLAutomatically(options.hostname);
            this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_AUTOMATIC_SETUP, options.hostname, true);
        }
    }
    async _shouldSetupNewSSL(options) {
        const isCustomSSL = this._sslReader.isCustomSSL(options.hostname);
        const isWxpSSL = this._sslReader.isWxpSSL(options.hostname);
        const doesSSLExist = isCustomSSL || isWxpSSL;
        // When SSL is not configured, set up a new SSL.
        if (!doesSSLExist) {
            this._logger.warning(format(LOGS.sslRequired, { hostname: options.hostname }), { prefix: LOGS.newLine });
            return true;
        }
        // When SSL is configured and the option to use existing is passed, do not set up a new SSL.
        if (options.useExisting) {
            console.log();
            return false;
        }
        // Prompt the user about the existing SSL and
        // check if the user wants to remove the existing to create a new one.
        this._logger.warning(format(LOGS.sslAlreadyConfigured, { hostname: options.hostname }), {
            prefix: LOGS.newLine
        });
        // Consider updating the signature of `_removeExistingSSL` to accept only `options`
        // when we introduce the @oclf command to `remove` an existing SSL.
        return await this._removeExistingSSL(options, isCustomSSL, isWxpSSL);
    }
    async _setupSSLManually(hostname) {
        const certificatePath = await this._promptUserForPath("certificate");
        const keyPath = await this._promptUserForPath("key");
        const userPreference = this._preferences.get();
        if (userPreference.ssl === undefined) {
            userPreference.ssl = new Map();
        }
        userPreference.ssl.set(hostname, { certificatePath, keyPath });
        this._preferences.set(userPreference);
        this._logger.success(LOGS.preferencesSaved, { prefix: LOGS.newLine, postfix: LOGS.newLine });
    }
    async _setupSSLAutomatically(hostname) {
        this._logger.information(LOGS.settingUpSSL, { prefix: LOGS.newLine });
        this._logger.message(LOGS.requireSystemPassword);
        this._logger.message(LOGS.requireSystemPasswordReason);
        this._logger.message(LOGS.retryRunningIfTakingLonger);
        const sslData = await devcert.certificateFor(hostname, { getCaPath: true });
        this._logger.success(LOGS.sslSetupComplete, { prefix: LOGS.newLine });
        if (sslData?.caPath) {
            const sslDirectory = path.resolve(sslData.caPath, "..", "..", "domains", hostname);
            this._logger.information(format(LOGS.findSSLCertificate, { sslDirectory }), { postfix: LOGS.newLine });
        }
    }
    async _removeExistingSSL(options, isCustomSSL, isWxpSSL) {
        const response = await prompts.prompt({
            type: "select",
            name: "shouldRemove",
            message: this._promptMessage(LOGS.removeExistingSSL),
            choices: [
                { title: this._promptMessageOption(LOGS.removeSSL), value: SSLRemoveOption.Remove },
                { title: this._promptMessageOption(LOGS.keepSSL), value: SSLRemoveOption.Keep }
            ],
            initial: 0
        });
        // If no response is obtained, which indicates something has gone wrong, then exit.
        if (!response || !response.shouldRemove) {
            this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_SSL_REMOVE, LOGS.sslRemoveOptionNotSpecified, false);
            return process.exit(1);
        }
        // If the user chooses to keep the existing SSL, do not set up a new SSL.
        if (response.shouldRemove === SSLRemoveOption.Keep) {
            console.log();
            return false;
        }
        // Remove the existing SSL based on how it was set up earlier.
        if (isCustomSSL) {
            const userPreference = this._preferences.get();
            userPreference.ssl.delete(options.hostname);
            this._preferences.set(userPreference);
            this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_MANUAL_REMOVE, options.hostname, true);
        }
        if (isWxpSSL) {
            await devcert.removeDomain(options.hostname);
            this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_AUTOMATIC_REMOVE, options.hostname, true);
        }
        this._logger.success(LOGS.removed, { postfix: LOGS.newLine });
        return true;
    }
    async _promptUserForPath(asset) {
        const promptData = {
            certificate: {
                type: "text",
                name: "sslPath",
                message: this._promptMessage(LOGS.specifyCertificatePath)
            },
            key: {
                type: "text",
                name: "sslPath",
                message: this._promptMessage(LOGS.specifyKeyPath)
            }
        };
        let maxTries = MAX_PROMPT_RETRIES;
        /* eslint-disable no-await-in-loop -- Retry logic */
        while (maxTries > 0) {
            const { sslPath } = await prompts.prompt(promptData[asset]);
            if (isFile(sslPath)) {
                return sslPath;
            }
            maxTries--;
            this._logger.error(format(LOGS.invalidPathSpecified, { asset }));
        }
        this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_SSL_SETUP, format(LOGS.invalidPathSpecified, { asset }), false);
        return process.exit(1);
    }
    _promptMessage(message) {
        return chalk.hex("#E59400")(message);
    }
    _promptMessageOption(message) {
        return chalk.green.bold(message);
    }
};
SetupCommandExecutor = __decorate([
    injectable(),
    __param(0, inject(ICoreTypes.Preferences)),
    __param(1, inject(ITypes.SSLReader)),
    __param(2, inject(IAnalyticsTypes.AnalyticsService)),
    __param(3, inject(ICoreTypes.Logger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SetupCommandExecutor);
export { SetupCommandExecutor };
const LOGS = {
    newLine: "\n",
    sslRequired: "The Add-on requires a trusted SSL certificate in order to run on https://{hostname}",
    sslAlreadyConfigured: "A trusted SSL certificate is already configured for the Add-on to run on https://{hostname}",
    removeExistingSSL: "Do you want to remove your existing SSL certificate to set up a new one",
    removeSSL: "Yes, remove the existing SSL certificate",
    keepSSL: "No, keep my existing SSL certificate",
    setupSSL: "How do you want to set up your SSL certificate",
    automatically: "Automatically, set it up for me",
    manually: "Manually, I already have an SSL certificate and key",
    settingUpSSL: "Setting up self-signed SSL certificate ...",
    requireSystemPassword: "This is only a one time step and may require you to enter your system's password",
    requireSystemPasswordReason: "so that the SSL certificate can be added to your system's trusted certificate path.",
    retryRunningIfTakingLonger: "[If this takes longer than expected, please break and retry]",
    sslSetupComplete: "SSL setup complete!",
    preferencesSaved: "Your preferences have been saved.",
    findSSLCertificate: "You can find the SSL certificate in {sslDirectory}.",
    specifyCertificatePath: "Please enter the path of your SSL certificate file",
    specifyKeyPath: "Please enter the path of your SSL key file",
    invalidPathSpecified: "Invalid {asset} path specified.",
    sslSetupOptionNotSpecified: "SSL setup option is not specified.",
    sslRemoveOptionNotSpecified: "SSL remove option is not specified.",
    removed: "Removed."
};
//# sourceMappingURL=SetupCommandExecutor.js.map