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
import { DEFAULT_HOST_NAME, ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import { ITypes as ISSLTypes, SetupCommandOptions } from "@adobe/ccweb-add-on-ssl";
import { inject, injectable, named } from "inversify";
import "reflect-metadata";
import { ITypes } from "../config/inversify.types.js";
/**
 * Add-on scaffolder implementation class for orchestrating the creation of the Add-on project.
 */
let TemplateAddOnScaffolder = class TemplateAddOnScaffolder {
    _addOnBuilderFactory;
    _packageBuilderFactory;
    _templateValidator;
    _sslCommandExecutor;
    _process;
    _logger;
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
    constructor(addOnBuilderFactory, packageBuilderFactory, templateValidator, sslCommandExecutor, cliProcess, logger) {
        this._addOnBuilderFactory = addOnBuilderFactory;
        this._packageBuilderFactory = packageBuilderFactory;
        this._templateValidator = templateValidator;
        this._sslCommandExecutor = sslCommandExecutor;
        this._process = cliProcess;
        this._logger = logger;
    }
    /**
     * Run the scaffolder to create the Add-on project from the provided options.
     * @param options - {@link ScaffolderOptions} reference.
     * @returns Promise.
     */
    async run(options) {
        try {
            this._templateValidator.validateTemplate(options.templateName);
            const addOnBuilder = this._addOnBuilderFactory(options);
            const packageJson = addOnBuilder.getPackageJson();
            const templateJson = addOnBuilder.getTemplateJson();
            const packageBuilder = this._packageBuilderFactory(packageJson)(templateJson);
            const combinedPackage = packageBuilder.build();
            addOnBuilder.build(combinedPackage.toJSON());
            const templateDevDependencies = addOnBuilder.getDevDependenciesToInstall(templateJson);
            await this._installDevDependencies(templateDevDependencies, options.verbose);
            const templateDependencies = addOnBuilder.getDependenciesToInstall(templateJson);
            await this._installDependencies(templateDependencies, options.verbose);
            await this._setupSSL(options.verbose);
            addOnBuilder.displaySuccess();
        }
        catch (error) {
            this._process.handleError(error);
            process.exit(1);
        }
    }
    async _installDevDependencies(templateDevDependencies, verbose) {
        if (templateDevDependencies.size > 0) {
            const devDependencyArgs = ["install", "--save-dev", "--save-exact", ...templateDevDependencies];
            if (verbose) {
                devDependencyArgs.push("--verbose");
            }
            this._logger.information(LOGS.installingTemplateDevDependencies, {
                prefix: LOGS.newLine
            });
            await this._process.execute("npm", devDependencyArgs, { stdio: "inherit" });
        }
    }
    async _installDependencies(templateDependencies, verbose) {
        if (templateDependencies.size > 0) {
            const dependencyArgs = ["install", "--save", "--save-exact", ...templateDependencies];
            if (verbose) {
                dependencyArgs.push("--verbose");
            }
            this._logger.information(LOGS.installingTemplateDependencies, {
                prefix: LOGS.newLine
            });
            await this._process.execute("npm", dependencyArgs, { stdio: "inherit" });
        }
    }
    async _setupSSL(verbose) {
        const setupCommandOptions = new SetupCommandOptions(DEFAULT_HOST_NAME, true, verbose);
        await this._sslCommandExecutor.execute(setupCommandOptions);
    }
};
TemplateAddOnScaffolder = __decorate([
    injectable(),
    __param(0, inject(ITypes.AddOnBuilder)),
    __param(1, inject(ITypes.PackageBuilder)),
    __param(2, inject(ITypes.TemplateValidator)),
    __param(3, inject(ISSLTypes.CommandExecutor)),
    __param(3, named("setup")),
    __param(4, inject(ICoreTypes.Process)),
    __param(5, inject(ICoreTypes.Logger)),
    __metadata("design:paramtypes", [Function, Function, Object, Object, Object, Object])
], TemplateAddOnScaffolder);
export { TemplateAddOnScaffolder };
const LOGS = {
    newLine: "\n",
    installingTemplateDevDependencies: "Installing template dev dependencies ...",
    installingTemplateDependencies: "Installing template dependencies ..."
};
//# sourceMappingURL=TemplateAddOnScaffolder.js.map