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
import type { AddOnScaffolder } from "@adobe/ccweb-add-on-scaffolder";
import "reflect-metadata";
import type { CLIOptions } from "../models/CLIOptions.js";
import type { DirectoryValidator, EnvironmentValidator } from "../validators/index.js";
import type { AddOnFactory } from "./AddOnFactory.js";
import type { TemplateSelector } from "./TemplateSelector.js";
/**
 * AddOn factory implementation class.
 */
export declare class WxpAddOnFactory implements AddOnFactory {
    private readonly _directoryValidator;
    private readonly _environmentValidator;
    private readonly _templateSelector;
    private readonly _scaffolder;
    private readonly _process;
    private readonly _logger;
    private readonly _analyticsService;
    /**
     * Instantiate {@link WxpAddOnFactory}.
     * @param directoryValidator - {@link DirectoryValidator} reference.
     * @param environmentValidator - {@link EnvironmentValidator} reference.
     * @param templateSelector - {@link TemplateSelector} reference.
     * @param scaffolder - {@link AddOnScaffolder} reference.
     * @param cliProcess - {@link Process} reference.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link WxpAddOnFactory} instance.
     */
    constructor(directoryValidator: DirectoryValidator, environmentValidator: EnvironmentValidator, templateSelector: TemplateSelector, scaffolder: AddOnScaffolder, cliProcess: Process, logger: Logger, analyticsService: AnalyticsService);
    /**
     * Create the Add-on project.
     * @param options - {@link CLIOptions}.
     */
    create(options: CLIOptions): Promise<void>;
    private _copyTemplateFiles;
}
//# sourceMappingURL=WxpAddOnFactory.d.ts.map