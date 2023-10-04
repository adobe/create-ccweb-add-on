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
import "reflect-metadata";
import type { DirectoryValidator } from "./DirectoryValidator.js";
/**
 * Directory validator implementation class to validate
 * whether the directory can be used to create the add-on project.
 */
export declare class AddOnDirectoryValidator implements DirectoryValidator {
    private readonly _logger;
    private readonly _analyticsService;
    /**
     * Instantiate {@link AddOnDirectoryValidator}.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link AddOnDirectoryValidator} instance.
     */
    constructor(logger: Logger, analyticsService: AnalyticsService);
    /**
     * Validate the Add-on name.
     * @param addOnName - Name of the Add-on.
     */
    validateAddOnName(addOnName: string): Promise<void>;
    /**
     * Validate the addOn directory.
     * @param addOnDirectory - Root directory of the addOn.
     * @param addOnName - Name of the addOn.
     */
    validateAddOnDirectory(addOnDirectory: string, addOnName: string): Promise<void>;
    private _chooseDifferentAddOnName;
}
//# sourceMappingURL=AddOnDirectoryValidator.d.ts.map