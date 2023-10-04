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
import type { Logger, Process } from "@adobe/ccweb-add-on-core";
import type { CommandExecutor as SSLCommandExecutor } from "@adobe/ccweb-add-on-ssl";
import "reflect-metadata";
import type { ScaffolderOptions } from "../models/ScaffolderOptions.js";
import type { TemplateValidator } from "../validators/index.js";
import type { AddOnBuilderFactory } from "./AddOnBuilder.js";
import type { AddOnScaffolder } from "./AddOnScaffolder.js";
import type { PackageBuilderFactory } from "./PackageBuilder.js";
/**
 * Add-on scaffolder implementation class for orchestrating the creation of the Add-on project.
 */
export declare class TemplateAddOnScaffolder implements AddOnScaffolder {
    private readonly _addOnBuilderFactory;
    private readonly _packageBuilderFactory;
    private readonly _templateValidator;
    private readonly _sslCommandExecutor;
    private readonly _process;
    private readonly _logger;
    /**
     * Instantiate {@link TemplateAppScaffolder}.
     * @param addOnBuilderFactory - {@link AddOnBuilderFactory} reference.
     * @param packageBuilderFactory - {@link PackageBuilderFactory} reference.
     * @param templateValidator - {@link TemplateValidator} reference.
     * @param sslCommandExecutor - {@link SSLCommandExecutor} reference.
     * @param cliProcess - {@link Process} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link TemplateAppScaffolder} instance.
     */
    constructor(addOnBuilderFactory: AddOnBuilderFactory, packageBuilderFactory: PackageBuilderFactory, templateValidator: TemplateValidator, sslCommandExecutor: SSLCommandExecutor, cliProcess: Process, logger: Logger);
    /**
     * Run the scaffolder to create the Add-on project from the provided options.
     * @param options - {@link ScaffolderOptions} reference.
     * @returns Promise.
     */
    run(options: ScaffolderOptions): Promise<void>;
    private _installDevDependencies;
    private _installDependencies;
    private _setupSSL;
}
//# sourceMappingURL=TemplateAddOnScaffolder.d.ts.map