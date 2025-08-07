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

import type { Logger } from "@adobe/ccweb-add-on-core";
import {
    ADDITIONAL_ADD_ON_INFO,
    DEFAULT_ADD_ON_VERSION,
    ITypes as ICoreTypes,
    PackageJson,
    TemplateJson,
    getJSONString,
    isNullOrWhiteSpace
} from "@adobe/ccweb-add-on-core";
import type { CreateManifestResult, ManifestEntrypoint } from "@adobe/ccweb-add-on-manifest";
import { AddOnManifest, EntrypointType } from "@adobe/ccweb-add-on-manifest";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import { createRequire } from "module";
import os from "os";
import path from "path";
import "reflect-metadata";
import format from "string-template";
import { v4 as uuidv4 } from "uuid";
import { MANIFEST_JSON, PACKAGE_JSON, TEMPLATE_JSON, TEMP_TEMPLATE_PATH } from "../constants.js";
import type { ScaffolderOptions } from "../models/ScaffolderOptions.js";

/**
 * Add-on builder factory.
 */
export type AddOnBuilderFactory = (options: ScaffolderOptions) => AddOnBuilder;

/**
 * Builder class for constructing the add-on project.
 */
@injectable()
export class AddOnBuilder {
    private readonly _logger: Logger;

    private _options!: ScaffolderOptions;
    private _require!: NodeRequire;
    private _templateRootDirectory!: string;

    private _gitignoreExists = false;
    private _readmeExists = false;

    /**
     * Instantiate {@link AddOnBuilder}.
     * @param options - {@link ScaffolderOptions}.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link AddOnBuilder} instance.
     */
    constructor(options: ScaffolderOptions, @inject(ICoreTypes.Logger) logger: Logger) {
        this._options = options;
        this._logger = logger;

        this._require = createRequire(import.meta.url);
        this._templateRootDirectory = path.join(process.cwd(), TEMP_TEMPLATE_PATH);
    }

    /**
     * Get {@link PackageJson}.
     *
     * @returns Reference of {@link PackageJson}.
     */
    getPackageJson(): PackageJson {
        const packageJsonPath = path.join(this._options.addOnDirectory, PACKAGE_JSON);
        return new PackageJson(this._require(packageJsonPath));
    }

    /**
     * Get {@link TemplateJson}.
     *
     * @returns Reference of {@link TemplateJson}.
     */
    getTemplateJson(): TemplateJson {
        const templateJsonPath = path.join(this._templateRootDirectory, TEMPLATE_JSON);
        return fs.existsSync(templateJsonPath)
            ? new TemplateJson(this._require(templateJsonPath))
            : new TemplateJson({});
    }

    /**
     * Get template devDependencies.
     *
     * @param template - {@link TemplateJson}
     * @returns Set of template devDependencies.
     */
    getDevDependenciesToInstall(template: TemplateJson): Set<string> {
        const devDependencies = new Set<string>();
        if (template.devDependencies) {
            template.devDependencies.forEach((value, key) => {
                devDependencies.add(`${key}@${value}`);
            });
        }

        return devDependencies;
    }

    /**
     * Get template dependencies.
     *
     * @param template - {@link TemplateJson}
     * @returns Set of template dependencies.
     */
    getDependenciesToInstall(template: TemplateJson): Set<string> {
        const dependencies = new Set<string>();
        if (template.dependencies) {
            template.dependencies.forEach((value, key) => {
                dependencies.add(`${key}@${value}`);
            });
        }

        return dependencies;
    }

    /**
     * Build the Add-on.
     *
     * @param packageJson - {@link PackageJson}
     */
    build(packageJson: string): void {
        fs.writeFileSync(path.join(this._options.addOnDirectory, PACKAGE_JSON), packageJson + os.EOL);

        this._updateReadMe();
        this._copyTemplateFiles();
        this._updateGitIgnore();
        this._updateManifest();
        this._removeTemplateTempFiles();
    }

    /**
     * Display success message.
     */
    displaySuccess(): void {
        let cdPath;
        if (
            !isNullOrWhiteSpace(this._options.rootDirectory) &&
            path.join(this._options.rootDirectory, this._options.addOnName) === this._options.addOnDirectory
        ) {
            cdPath = this._options.addOnName;
        } else {
            cdPath = this._options.addOnDirectory;
        }

        this._logger.success(
            format(LOGS.successCreatedAddOn, {
                addOnName: this._options.addOnName,
                addOnDirectory: this._options.addOnDirectory
            })
        );
        this._logger.success(LOGS.insideDirectoryCommandsToRun, { postfix: LOGS.newLine });

        this._logger.information(LOGS.npmRunBuild, { prefix: `${LOGS.tab}` });
        this._logger.message(LOGS.buildsTheAddOn, { prefix: `${LOGS.tab}${LOGS.tab}` });
        this._logger.information(LOGS.npmRunStart, { prefix: LOGS.tab });
        this._logger.message(LOGS.startsTheAddOn, { prefix: `${LOGS.tab}${LOGS.tab}` });

        this._logger.message(LOGS.suggestBeginByTyping, {
            prefix: LOGS.newLine,
            postfix: LOGS.newLine
        });

        this._logger.warning(format(LOGS.changeDirectoryIntoCreatedApp, { cdPath }), {
            prefix: LOGS.tab
        });
        this._logger.information(LOGS.npmRunBuild, { prefix: LOGS.tab });
        this._logger.information(LOGS.npmRunStart, { prefix: LOGS.tab, postfix: LOGS.newLine });

        if (this._readmeExists) {
            this._logger.warning(LOGS.renamedReadme, { postfix: LOGS.newLine });
        }

        if (this._gitignoreExists) {
            this._logger.warning(LOGS.mergedGitIgnore, { postfix: LOGS.newLine });
        }

        this._logger.warning(LOGS.whatWillYouCreateToday, { postfix: LOGS.newLine });
    }

    private _updateReadMe(): void {
        this._readmeExists = fs.existsSync(path.join(this._options.addOnDirectory, "README.md"));
        if (this._readmeExists) {
            fs.renameSync(
                path.join(this._options.addOnDirectory, "README.md"),
                path.join(this._options.addOnDirectory, "README.OLD.md")
            );
        }
    }

    private _copyTemplateFiles(): void {
        const templateContentDirectory = path.join(this._templateRootDirectory, "template");
        if (fs.existsSync(templateContentDirectory)) {
            fs.copySync(templateContentDirectory, this._options.addOnDirectory);
        } else {
            this._logger.warning(format(LOGS.couldNotLocateTemplate, { templateContentDirectory }));
            process.exit(1);
        }
    }

    private _updateGitIgnore(): void {
        this._gitignoreExists = fs.existsSync(path.join(this._options.addOnDirectory, ".gitignore"));
        if (this._gitignoreExists) {
            const data = fs.readFileSync(path.join(this._options.addOnDirectory, "gitignore"));
            fs.appendFileSync(path.join(this._options.addOnDirectory, ".gitignore"), data);
            fs.unlinkSync(path.join(this._options.addOnDirectory, "gitignore"));
        } else {
            fs.moveSync(
                path.join(this._options.addOnDirectory, "gitignore"),
                path.join(this._options.addOnDirectory, ".gitignore")
            );
        }
    }

    private _updateManifest(): void {
        const manifestJsonPath = path.join(this._options.addOnDirectory, "src", MANIFEST_JSON);
        const manifestExists = fs.existsSync(manifestJsonPath);

        let createManifestResult: CreateManifestResult;
        if (manifestExists) {
            const manifestFile = this._require(manifestJsonPath);
            const addOnName = this._getAddOnName(this._options.addOnName);
            const manifestEntryPoints = (manifestFile.entryPoints as ManifestEntrypoint[]) ?? [];
            createManifestResult = AddOnManifest.createManifest({
                manifest: {
                    ...manifestFile,
                    testId: uuidv4(),
                    name: addOnName,
                    version: DEFAULT_ADD_ON_VERSION,
                    entryPoints: manifestEntryPoints
                },
                additionalInfo: ADDITIONAL_ADD_ON_INFO
            });

            fs.unlinkSync(manifestJsonPath);
        } else {
            createManifestResult = AddOnManifest.createManifest({
                manifest: {
                    testId: uuidv4(),
                    name: this._getAddOnName(this._options.addOnName),
                    version: DEFAULT_ADD_ON_VERSION,
                    manifestVersion: 2,
                    requirements: {
                        apps: [
                            {
                                name: "Express",
                                apiVersion: 1
                            }
                        ]
                    },
                    entryPoints: [
                        {
                            type: EntrypointType.PANEL,
                            id: this._options.addOnName,
                            main: ""
                        }
                    ]
                },
                additionalInfo: ADDITIONAL_ADD_ON_INFO
            });
        }

        if (createManifestResult.manifest === undefined) {
            return this._logger.warning(
                format(LOGS.invalidManifestInTemplate, {
                    templateName: this._options.templateName,
                    error: getJSONString(createManifestResult.manifestValidationResult)
                })
            );
        }

        fs.writeFileSync(manifestJsonPath, getJSONString(createManifestResult.manifest.manifestProperties) + os.EOL);
    }

    private _getAddOnName(addOnName: string): string {
        const camelCase = addOnName.replace(/[-_]\w/g, text => text.replace(/[-_]/, "").toUpperCase());
        const wordCase = camelCase.replace(/([A-Z])/g, " $1");
        return wordCase.charAt(0).toUpperCase() + wordCase.slice(1);
    }

    private _removeTemplateTempFiles(): void {
        fs.removeSync(this._templateRootDirectory);
    }
}

const LOGS = {
    newLine: "\n",
    tab: "  ",
    couldNotLocateTemplate: "Could not locate template: {templateContentDirectory}",
    invalidManifestInTemplate: "Invalid manifest in the template: {templateName}. Error: {error}",
    successCreatedAddOn: "Success! Created {addOnName} at {addOnDirectory}.",
    insideDirectoryCommandsToRun: "Inside this directory, you can run the following commands:",
    npmRunBuild: "npm run build",
    npmRunStart: "npm run start",
    buildsTheAddOn: "Builds the Add-on.",
    startsTheAddOn: "Starts the development server and hosts the Add-on.",
    suggestBeginByTyping: "We suggest that you begin by typing:",
    changeDirectoryIntoCreatedApp: "cd {cdPath}",
    renamedReadme: "You had a 'README.md' file, we renamed it to 'README.OLD.md'",
    mergedGitIgnore: "You had a '.gitignore' file, we merged it with the template '.gitignore'",
    whatWillYouCreateToday: "So what will you create today?"
};
