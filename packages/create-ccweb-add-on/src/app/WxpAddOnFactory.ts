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
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import type { Logger, Process } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import type { AddOnScaffolder } from "@adobe/ccweb-add-on-scaffolder";
import { ITypes as IScaffolderTypes, PACKAGE_JSON, ScaffolderOptions } from "@adobe/ccweb-add-on-scaffolder";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import os from "os";
import path from "path";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import url from "url";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import { TEMP_TEMPLATE_PATH } from "../constants.js";
import type { CLIOptions } from "../models/CLIOptions.js";
import type { DirectoryValidator, EnvironmentValidator } from "../validators/index.js";
import type { AddOnFactory } from "./AddOnFactory.js";
import { AddOnPackageManager } from "./AddOnPackageManager.js";
import type { TemplateSelector } from "./TemplateSelector.js";

/**
 * AddOn factory implementation class.
 */
@injectable()
export class WxpAddOnFactory implements AddOnFactory {
    private readonly _directoryValidator: DirectoryValidator;
    private readonly _environmentValidator: EnvironmentValidator;
    private readonly _templateSelector: TemplateSelector;

    private readonly _scaffolder: AddOnScaffolder;

    private readonly _process: Process;
    private readonly _logger: Logger;

    private readonly _analyticsService: AnalyticsService;

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
    constructor(
        @inject(ITypes.DirectoryValidator) directoryValidator: DirectoryValidator,
        @inject(ITypes.EnvironmentValidator) environmentValidator: EnvironmentValidator,
        @inject(ITypes.TemplateSelector) templateSelector: TemplateSelector,
        @inject(IScaffolderTypes.AddOnScaffolder) scaffolder: AddOnScaffolder,
        @inject(ICoreTypes.Process) cliProcess: Process,
        @inject(ICoreTypes.Logger) logger: Logger,
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService
    ) {
        this._directoryValidator = directoryValidator;
        this._environmentValidator = environmentValidator;
        this._templateSelector = templateSelector;

        this._scaffolder = scaffolder;

        this._process = cliProcess;
        this._logger = logger;

        this._analyticsService = analyticsService;
    }

    /**
     * Create the Add-on project.
     * @param options - {@link CLIOptions}.
     */
    async create(options: CLIOptions): Promise<void> {
        let addOnDirectory = "";

        try {
            await this._environmentValidator.validateNodeVersion();
            await this._environmentValidator.validateNpmVersion();
            await this._environmentValidator.validateNpmConfiguration();

            await this._directoryValidator.validateAddOnName(options.addOnName);
            addOnDirectory = path.resolve(options.addOnName);
            await this._directoryValidator.validateAddOnDirectory(addOnDirectory, options.addOnName);

            this._logger.information(LOGS.creatingWxpAddOn);
            this._logger.message(LOGS.mayTakeAMinute);

            const templateName = await this._templateSelector.setupTemplate(options);

            const packageJson = AddOnPackageManager.getPackageJson(options.entrypointType, options.addOnName);
            const packageJsonPath = path.join(addOnDirectory, PACKAGE_JSON);

            fs.writeFileSync(packageJsonPath, packageJson.toJSON() + os.EOL);

            this._copyTemplateFiles(addOnDirectory, templateName);

            const rootDirectory = process.cwd();
            process.chdir(addOnDirectory);

            const devDependencyArgs = [
                "install",
                "--save-dev",
                "@adobe/ccweb-add-on-scripts",
                "@types/adobe__ccweb-add-on-sdk"
            ];

            if (options.verbose) {
                devDependencyArgs.push("--verbose");
            }

            this._logger.information(LOGS.installingDevDependencies, { prefix: LOGS.newLine });
            await this._process.execute("npm", devDependencyArgs, { stdio: "inherit" });

            const scaffolderOptions = new ScaffolderOptions(
                addOnDirectory,
                options.addOnName,
                options.entrypointType,
                rootDirectory,
                templateName,
                options.verbose
            );

            this._logger.information(format(LOGS.scaffoldingProjectFromTemplate, { templateName }), {
                prefix: LOGS.newLine
            });

            await this._scaffolder.run(scaffolderOptions);

            const analyticsEventData = [
                "--addOnName",
                options.addOnName,
                "--entrypointType",
                options.entrypointType,
                "--template",
                templateName
            ];
            await this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESS, analyticsEventData.join(" "), true);
        } catch (error) {
            this._process.handleError(error);
            this._process.removeAddOn(addOnDirectory, options.addOnName);
            await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_UNKNOWN_REASON, error.message, false);

            return process.exit(0);
        }
    }

    private _copyTemplateFiles(addOnDirectory: string, templateName: string) {
        const targetPath = path.join(addOnDirectory, TEMP_TEMPLATE_PATH);
        fs.ensureDirSync(targetPath);

        const templateDirectory = path.join(url.fileURLToPath(import.meta.url), "..", "..", "templates", templateName);

        if (fs.existsSync(templateDirectory)) {
            fs.copySync(templateDirectory, targetPath);
        } else {
            this._logger.error(LOGS.templateNotFound);
            process.exit(1);
        }
    }
}

const LOGS = {
    newLine: "\n",
    creatingWxpAddOn: "Creating a new Add-on ...",
    mayTakeAMinute: "This may take a minute ...",
    installingDevDependencies: "Installing dev dependencies ...",
    scaffoldingProjectFromTemplate: "Scaffolding project from template: {templateName} ...",
    templateNotFound: "Could not find the artifacts for the selected template."
};
