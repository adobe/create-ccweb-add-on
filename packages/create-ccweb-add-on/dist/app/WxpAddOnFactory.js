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
import { ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
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
import { AddOnManager } from "./AddOnManager.js";
/**
 * AddOn factory implementation class.
 */
let WxpAddOnFactory = class WxpAddOnFactory {
    _directoryValidator;
    _environmentValidator;
    _templateSelector;
    _scaffolder;
    _process;
    _logger;
    _analyticsService;
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
    constructor(directoryValidator, environmentValidator, templateSelector, scaffolder, cliProcess, logger, analyticsService) {
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
    async create(options) {
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
            const packageJson = AddOnManager.getPackageJson(options.addOnKind, options.addOnName);
            const packageJsonPath = path.join(addOnDirectory, PACKAGE_JSON);
            fs.writeFileSync(packageJsonPath, packageJson.toJSON() + os.EOL);
            this._copyTemplateFiles(addOnDirectory, templateName);
            const rootDirectory = process.cwd();
            process.chdir(addOnDirectory);
            const devDependencyArgs = ["install", "--save-dev", "@adobe/ccweb-add-on-scripts"];
            if (templateName.includes("typescript")) {
                devDependencyArgs.push("@adobe/ccweb-add-on-sdk-types");
            }
            if (options.verbose) {
                devDependencyArgs.push("--verbose");
            }
            this._logger.information(LOGS.installingDevDependencies, { prefix: LOGS.newLine });
            await this._process.execute("npm", devDependencyArgs, { stdio: "inherit" });
            const scaffolderOptions = new ScaffolderOptions(addOnDirectory, options.addOnName, options.addOnKind, rootDirectory, templateName, options.verbose);
            this._logger.information(format(LOGS.scaffoldingProjectFromTemplate, { templateName }), {
                prefix: LOGS.newLine
            });
            await this._scaffolder.run(scaffolderOptions);
            const analyticsEventData = [
                "--addOnName",
                options.addOnName,
                "--kind",
                options.addOnKind,
                "--template",
                templateName
            ];
            await this._analyticsService.postEvent(AnalyticsSuccessMarkers.SUCCESS, analyticsEventData.join(" "), true);
        }
        catch (error) {
            this._process.handleError(error);
            this._process.removeAddOn(addOnDirectory, options.addOnName);
            await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_UNKNOWN_REASON, error.message, false);
            return process.exit(0);
        }
    }
    _copyTemplateFiles(addOnDirectory, templateName) {
        const targetPath = path.join(addOnDirectory, TEMP_TEMPLATE_PATH);
        fs.ensureDirSync(targetPath);
        const templateFilePath = path.join(import.meta.url, "..", "..", "templates", templateName);
        const templateDirectory = url.fileURLToPath(templateFilePath);
        if (fs.existsSync(templateDirectory)) {
            fs.copySync(templateDirectory, targetPath);
        }
        else {
            this._logger.error(LOGS.templateNotFound);
            process.exit(1);
        }
    }
};
WxpAddOnFactory = __decorate([
    injectable(),
    __param(0, inject(ITypes.DirectoryValidator)),
    __param(1, inject(ITypes.EnvironmentValidator)),
    __param(2, inject(ITypes.TemplateSelector)),
    __param(3, inject(IScaffolderTypes.AddOnScaffolder)),
    __param(4, inject(ICoreTypes.Process)),
    __param(5, inject(ICoreTypes.Logger)),
    __param(6, inject(IAnalyticsTypes.AnalyticsService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], WxpAddOnFactory);
export { WxpAddOnFactory };
const LOGS = {
    newLine: "\n",
    creatingWxpAddOn: "Creating a new Add-on ...",
    mayTakeAMinute: "This may take a minute ...",
    installingDevDependencies: "Installing dev dependencies ...",
    scaffoldingProjectFromTemplate: "Scaffolding project from template: {templateName} ...",
    templateNotFound: "Could not find the artifacts for the selected template."
};
//# sourceMappingURL=WxpAddOnFactory.js.map