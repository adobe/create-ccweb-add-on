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
import type { SetupCommandOptions } from "../models/index.js";
import type { CommandValidator } from "./CommandValidator.js";
/**
 * Setup command validator implementation class.
 */
export declare class SetupCommandValidator implements CommandValidator {
    private readonly _accountService;
    private readonly _analyticsService;
    private readonly _logger;
    /**
     * Instantiate {@link SetupCommandValidator}.
     * @param accountService - {@link AccountService} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link SetupCommandValidator} instance.
     */
    constructor(accountService: AccountService, analyticsService: AnalyticsService, logger: Logger);
    /**
     * Validate setup command options.
     * @param options - Setup command arguments provided by user.
     * @returns - Promise.
     */
    validate(options: SetupCommandOptions): Promise<void>;
}
//# sourceMappingURL=SetupCommandValidator.d.ts.map