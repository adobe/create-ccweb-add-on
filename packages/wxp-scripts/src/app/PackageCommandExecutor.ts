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
import { DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import type { ManifestError, ManifestValidationResult } from "@adobe/ccweb-add-on-manifest";
import { inject, injectable, named } from "inversify";
import path from "path";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import { ITypes } from "../config/inversify.types.js";
import type { PackageCommandOptions } from "../models/PackageCommandOptions.js";
import type { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import { PackageManager } from "../utilities/PackageManager.js";
import type { CommandExecutor } from "./CommandExecutor.js";

/**
 * Package command executor.
 */
@injectable()
export class PackageCommandExecutor implements CommandExecutor {
    private readonly _buildCommandExecutor: CommandExecutor;
    private readonly _logger: Logger;
    private readonly _manifestReader: AddOnManifestReader;

    /**
     * Instantiate {@link PackageCommandExecutor}.
     *
     * @param buildCommandExecutor - {@link CommandExecutor} reference.
     * @param logger - {@link Logger} reference.
     * @param manifestReader - {@link AddOnManifestReader} reference.
     * @returns Reference to a new {@link PackageCommandExecutor} instance.
     */
    constructor(
        @inject(ITypes.CommandExecutor) @named("build") buildCommandExecutor: CommandExecutor,
        @inject(ICoreTypes.Logger) logger: Logger,
        @inject(ITypes.AddOnManifestReader) manifestReader: AddOnManifestReader
    ) {
        this._buildCommandExecutor = buildCommandExecutor;
        this._logger = logger;
        this._manifestReader = manifestReader;
    }

    /**
     * Creates a package of the dist folder.
     *
     * @param options - {@link PackageCommandOptions}.
     * @returns Promise.
     */
    async execute(options: PackageCommandOptions): Promise<void> {
        if (options.shouldRebuild) {
            const isBuildSuccessful = await this._buildCommandExecutor.execute(options);
            if (!isBuildSuccessful) {
                return;
            }
        } else {
            await this._manifestReader.getManifest(this._onValidationFailed, options.shouldRebuild)!;
        }
        await this._packageContent();
    }

    private _onValidationFailed = (failedResult: ManifestValidationResult) => {
        this._logger.error(LOGS.manifestValidationFailed);

        const { errorDetails } = failedResult;

        if (errorDetails !== undefined && errorDetails.length > 0) {
            errorDetails.forEach((manifestError?: ManifestError) => {
                if (!isNullOrWhiteSpace(manifestError?.message)) {
                    this._logger.error(
                        `${
                            !isNullOrWhiteSpace(manifestError?.instancePath) ? `${manifestError!.instancePath} - ` : ""
                        }${manifestError!.message}`
                    );
                }
            });

            console.log();
            process.exit(1);
        }
    };

    private async _packageContent(): Promise<void> {
        try {
            this._logger.information(
                format(LOGS.creatingZip, {
                    outputDirectory: DEFAULT_OUTPUT_DIRECTORY
                })
            );

            const packageGenerator = PackageManager.generatePackageManager();
            const zipFilePath = path.join(process.cwd(), `${DEFAULT_OUTPUT_DIRECTORY}.zip`);

            packageGenerator.addLocalFolder(path.resolve(DEFAULT_OUTPUT_DIRECTORY), "", PackageManager.filterOSFiles);
            packageGenerator.writeZip(zipFilePath);

            this._logger.success(LOGS.done, { postfix: LOGS.newLine });
        } catch (error) {
            this._logger.error(
                format(LOGS.somethingWentWrong, {
                    outputDirectory: DEFAULT_OUTPUT_DIRECTORY
                })
            );
        }
    }
}

const LOGS = {
    newLine: "\n",
    creatingZip: "Creating a zip from {outputDirectory}/ ...",
    done: "Done.",
    somethingWentWrong: "Something went wrong while creating a zip from {outputDirectory}.",
    manifestValidationFailed: "Add-on manifest validation failed.",
    entryPointMainNotFound:
        "Specified main in the {entryPointType}: {entryPointName} does not exist in {outputDirectory}."
};
