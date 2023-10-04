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
import type { Logger, Preferences } from "@adobe/ccweb-add-on-core";
import "reflect-metadata";
import type { SetupCommandOptions } from "../models/SetupCommandOptions.js";
import type { CommandExecutor } from "./CommandExecutor.js";
import type { SSLReader } from "./SSLReader.js";
/**
 * Setup command execution implementation class.
 */
export declare class SetupCommandExecutor implements CommandExecutor {
    private readonly _preferences;
    private readonly _sslReader;
    private readonly _analyticsService;
    private readonly _logger;
    /**
     * Instantiate {@link SetupCommandExecutor}.
     * @param preferences - {@link Preferences} reference.
     * @param sslReader - {@link SSLReader} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link SetupCommandExecutor} instance.
     */
    constructor(preferences: Preferences, sslReader: SSLReader, analyticsService: AnalyticsService, logger: Logger);
    /**
     * Setup self-signed SSL certificate and key by checking if user defined preferences
     * have SSL config data or if the user has already setup the certificates last time.
     * Otherwise prompt the user to setup the SSL themselves by providing paths as the input or
     * by allowing the CLI to setup the certificates on user's behalf.
     * @param options - Command arguments provided by user represented as {@link SetupCommandOptions}.
     * @returns Promise.
     */
    execute(options: SetupCommandOptions): Promise<void>;
    private _shouldSetupNewSSL;
    private _setupSSLManually;
    private _setupSSLAutomatically;
    private _removeExistingSSL;
    private _promptUserForPath;
    private _promptMessage;
    private _promptMessageOption;
}
//# sourceMappingURL=SetupCommandExecutor.d.ts.map