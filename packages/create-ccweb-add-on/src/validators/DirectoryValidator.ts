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
import type { Logger } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import path from "path";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import validate from "validate-npm-package-name";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import { PROGRAM_NAME } from "../constants.js";

/**
 * Directory validator implementation class to validate
 * whether the directory can be used to create the add-on project.
 */
@injectable()
export class DirectoryValidator {
    private readonly _logger: Logger;
    private readonly _analyticsService: AnalyticsService;

    /**
     * Instantiate {@link DirectoryValidator}.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link DirectoryValidator} instance.
     */
    constructor(
        @inject(ICoreTypes.Logger) logger: Logger,
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService
    ) {
        this._logger = logger;
        this._analyticsService = analyticsService;
    }

    /**
     * Validate the Add-on name.
     * @param addOnName - Name of the Add-on.
     */
    async validateAddOnName(addOnName: string): Promise<void> {
        if (isNullOrWhiteSpace(addOnName)) {
            this._logger.warning(LOGS.specifyAddOnName);
            this._chooseDifferentAddOnName();
            await this._analyticsService.postEvent(
                AnalyticsErrorMarkers.ERROR_NO_ADD_ON_NAME,
                LOGS.analyticsNoAddOnName,
                false
            );
            return process.exit(0);
        }

        const isValid = validate(addOnName).validForNewPackages;
        if (!isValid) {
            this._logger.warning(format(LOGS.npmNamingRestriction, { addOnName }));
            this._chooseDifferentAddOnName();
            await this._analyticsService.postEvent(
                AnalyticsErrorMarkers.ERROR_INVALID_NAME_NPM,
                LOGS.analyticsInvalidAddOnNameNPM,
                false
            );
            return process.exit(0);
        }

        const dependencies = new Set([
            "@adobe/create-ccweb-add-on",
            "create-ccweb-add-on",
            "@adobe/ccweb-add-on-scripts",
            "ccweb-add-on-scripts",
            "@adobe/ccweb-add-on-scaffolder",
            "ccweb-add-on-scaffolder"
        ]);
        if (dependencies.has(addOnName)) {
            this._logger.warning(format(LOGS.dependencyNamingRestriction, { addOnName }));
            this._chooseDifferentAddOnName();
            await this._analyticsService.postEvent(
                AnalyticsErrorMarkers.ERROR_INVALID_NAME_DEP,
                LOGS.analyticsInvalidAddOnNameDependency,
                false
            );
            return process.exit(0);
        }
    }

    /**
     * Validate the addOn directory.
     * @param addOnDirectory - Root directory of the addOn.
     * @param addOnName - Name of the addOn.
     */
    async validateAddOnDirectory(addOnDirectory: string, addOnName: string): Promise<void> {
        fs.ensureDirSync(addOnName);

        const validFiles = [
            ".DS_Store",
            ".git",
            ".gitattributes",
            ".gitignore",
            ".gitlab-ci.yml",
            ".hg",
            ".hgcheck",
            ".hgignore",
            ".idea",
            ".npmignore",
            ".travis.yml",
            "docs",
            "LICENSE",
            "README.md",
            "mkdocs.yml",
            "Thumbs.db"
        ];

        const errorLogFilePatterns = ["npm-debug.log"];

        const isErrorLog = (file: string) => {
            return errorLogFilePatterns.some(pattern => file.startsWith(pattern));
        };

        const existingFiles = fs.readdirSync(addOnDirectory, { withFileTypes: true });
        const conflictingFiles = existingFiles
            .filter(file => !validFiles.includes(file.name))
            .filter(file => !/\.iml$/.test(file.name))
            .filter(file => !isErrorLog(file.name));

        if (conflictingFiles.length === 0) {
            return;
        }

        this._logger.warning(format(LOGS.directoryContainsFiles, { addOnName }), {
            postfix: LOGS.newLine
        });

        for (const file of conflictingFiles) {
            try {
                if (fs.lstatSync(path.join(addOnDirectory, file.name)).isDirectory()) {
                    this._logger.warning(`${file.name}/`, { prefix: LOGS.tab });
                } else {
                    this._logger.warning(`${file.name}`, { prefix: LOGS.tab });
                }
            } catch {
                this._logger.warning(`${file.name}`, { prefix: LOGS.tab });
            }
        }

        this._logger.information(LOGS.newAddOnOrRemoveFiles, { prefix: LOGS.newLine });
        await this._analyticsService.postEvent(
            AnalyticsErrorMarkers.ERROR_INVALID_NAME_DIR,
            LOGS.analyticsInvalidAddOnDir,
            false
        );
        return process.exit(0);
    }

    private _chooseDifferentAddOnName() {
        this._logger.warning(format(LOGS.executeProgram, { PROGRAM_NAME }), { prefix: LOGS.tab });
        this._logger.message(LOGS.forExample, { prefix: LOGS.newLine });
        this._logger.information(format(LOGS.executeProgramExample, { PROGRAM_NAME }), {
            prefix: LOGS.tab,
            postfix: LOGS.newLine
        });
    }
}

const LOGS = {
    newLine: "\n",
    tab: "  ",
    specifyAddOnName: "Please specify an Add-on name",
    executeProgram: "{PROGRAM_NAME} <add-on-name> --entrypoint <panel> --template <javascript>",
    executeProgramExample: "{PROGRAM_NAME} my-add-on --entrypoint panel --template javascript",
    forExample: "For example:",
    npmNamingRestriction: "Cannot create a project named {addOnName} because of NPM naming restrictions.",
    dependencyNamingRestriction:
        "Cannot create a project named {addOnName} because a dependency with the same name exists.",
    chooseDifferentAddOnName: "Please choose a different Add-on name:",
    directoryContainsFiles: "The directory {addOnName} contains files that could conflict:",
    newAddOnOrRemoveFiles: "Either try using a new Add-on name, or remove the files listed above.",
    analyticsNoAddOnName: "Add-on name was not specified",
    analyticsInvalidAddOnNameNPM: "Invalid Add-on name. Npm name check failed",
    analyticsInvalidAddOnNameDependency: "Invalid Add-on name. Dependency with same name exists",
    analyticsInvalidAddOnDir: "Invalid Add-on name. Conflicting directory with same name exists"
};
