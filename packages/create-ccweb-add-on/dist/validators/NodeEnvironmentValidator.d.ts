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
import type { Logger, Process } from "@adobe/ccweb-add-on-core";
import "reflect-metadata";
import type { EnvironmentValidator } from "./EnvironmentValidator.js";
/**
 * Environment validator implementation class to validate
 * the system requirements required for running the app.
 */
export declare class NodeEnvironmentValidator implements EnvironmentValidator {
    private readonly _process;
    private readonly _logger;
    private readonly _analyticsService;
    /**
     * Instantiate {@link NodeEnvironmentValidator}.
     *
     * @param processHandler - {@link Process} reference.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link NodeEnvironmentValidator} instance.
     */
    constructor(processHandler: Process, logger: Logger, analyticsService: AnalyticsService);
    /**
     * Validate the node version in the user's system.
     */
    validateNodeVersion(): Promise<void>;
    /**
     * Validate the npm version in the user's system.
     */
    validateNpmVersion(): Promise<void>;
    /**
     * Validate the npm configuration in the user's system.
     */
    validateNpmConfiguration(): Promise<void>;
}
//# sourceMappingURL=NodeEnvironmentValidator.d.ts.map