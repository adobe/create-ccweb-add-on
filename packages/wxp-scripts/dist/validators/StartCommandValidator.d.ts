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
import type { Logger } from "@adobe/ccweb-add-on-core";
import type { AccountService } from "@adobe/ccweb-add-on-developer-terms";
import "reflect-metadata";
import type { StartCommandOptions } from "../models/StartCommandOptions.js";
import type { CommandValidator } from "./CommandValidator.js";
/**
 * Start command validator implementation class.
 */
export declare class StartCommandValidator implements CommandValidator {
    private readonly _accountService;
    private readonly _analyticsService;
    private readonly _logger;
    /**
     * Instantiate {@link StartCommandValidator}.
     * @param accountService - {@link AccountService} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link StartCommandValidator} instance.
     */
    constructor(accountService: AccountService, analyticsService: AnalyticsService, logger: Logger);
    /**
     * Validate start command options.
     * @param options - Start command arguments provided by user.
     * @returns - Promise.
     */
    validate(options: StartCommandOptions): Promise<void>;
    private _validateHostname;
    private _validatePort;
}
//# sourceMappingURL=StartCommandValidator.d.ts.map