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
import { ALLOWED_HOSTNAMES, DEFAULT_HOST_NAME, ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import { ITypes as IDeveloperTermsTypes } from "@adobe/ccweb-add-on-developer-terms";
import { inject, injectable } from "inversify";
import isValidDomain from "is-valid-domain";
import process from "process";
import "reflect-metadata";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
/**
 * Start command validator implementation class.
 */
let StartCommandValidator = class StartCommandValidator {
    _accountService;
    _analyticsService;
    _logger;
    /**
     * Instantiate {@link StartCommandValidator}.
     * @param accountService - {@link AccountService} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link StartCommandValidator} instance.
     */
    constructor(accountService, analyticsService, logger) {
        this._accountService = accountService;
        this._analyticsService = analyticsService;
        this._logger = logger;
    }
    /**
     * Validate start command options.
     * @param options - Start command arguments provided by user.
     * @returns - Promise.
     */
    async validate(options) {
        await this._validateHostname(options);
        await this._validatePort(options);
    }
    async _validateHostname(options) {
        const isUserPrivileged = await this._accountService.isUserPrivileged();
        const eventData = [
            "--use",
            options.transpiler,
            "--hostname",
            options.hostname,
            "--port",
            options.port,
            "--isUserPrivileged",
            isUserPrivileged
        ];
        if (options.hostname !== DEFAULT_HOST_NAME && !isUserPrivileged) {
            this._logger.error(LOGS.invalidHostname, { postfix: LOGS.newLine });
            await this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_START_INVALID_HOSTNAME_ERROR, eventData.join(" "), false);
            return process.exit(1);
        }
        const isHostnameAllowed = options.hostname === DEFAULT_HOST_NAME ||
            (isValidDomain(options.hostname) && ALLOWED_HOSTNAMES.test(options.hostname));
        if (!isHostnameAllowed) {
            this._logger.error(LOGS.invalidPrivilegedHostname, { postfix: LOGS.newLine });
            await this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_START_INVALID_HOSTNAME_ERROR, eventData.join(" "), false);
            return process.exit(1);
        }
    }
    async _validatePort(options) {
        if (!isNaN(options.port) && options.port >= 80 && options.port <= 65535) {
            return;
        }
        this._logger.error(LOGS.invalidPort, { postfix: LOGS.newLine });
        const eventData = ["--use", options.transpiler, "--hostname", options.hostname, "--port", options.port];
        await this._analyticsService.postEvent(AnalyticsErrorMarkers.SCRIPTS_START_INVALID_PORT_ERROR, eventData.join(" "), false);
        return process.exit(1);
    }
};
StartCommandValidator = __decorate([
    injectable(),
    __param(0, inject(IDeveloperTermsTypes.AccountService)),
    __param(1, inject(IAnalyticsTypes.AnalyticsService)),
    __param(2, inject(ICoreTypes.Logger)),
    __metadata("design:paramtypes", [Object, Object, Object])
], StartCommandValidator);
export { StartCommandValidator };
const LOGS = {
    newLine: "\n",
    invalidHostname: "Invalid hostname. Only 'localhost' is allowed.",
    invalidPrivilegedHostname: "Invalid hostname. Only 'localhost' and '*.adobe.com' are allowed.",
    invalidPort: "Invalid port. Please provide a value between 80 and 65535."
};
//# sourceMappingURL=StartCommandValidator.js.map