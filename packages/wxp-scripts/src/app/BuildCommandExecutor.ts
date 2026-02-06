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
import { DEFAULT_OUTPUT_DIRECTORY, ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import type { AddOnManifest, ManifestError, ManifestValidationResult } from "@adobe/ccweb-add-on-manifest";
import { inject, injectable, named } from "inversify";
import "reflect-metadata";
import fs from "fs-extra";
import path from "path";
import format from "string-template";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../AnalyticsMarkers.js";
import { ITypes } from "../config/inversify.types.js";
import { AddOnDirectory } from "../models/AddOnDirectory.js";
import type { BuildCommandOptions } from "../models/BuildCommandOptions.js";
import type { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import type { CommandExecutor } from "./CommandExecutor.js";
import type { ScriptManager } from "./ScriptManager.js";
import { GlobalOverrides } from "../utilities/GlobalOverrides.js";

/**
 * Build command executor.
 */
@injectable()
export class BuildCommandExecutor implements CommandExecutor<BuildCommandOptions> {
    private readonly _scriptManager: ScriptManager;
    private readonly _logger: Logger;
    private readonly _cleanCommandExecutor: CommandExecutor;
    private readonly _manifestReader: AddOnManifestReader;
    private readonly _analyticsService: AnalyticsService;

    /**
     * Instantiate {@link BuildCommandExecutor}.
     * @param scriptManager - {@link ScriptManager} reference.
     * @param logger - {@link Logger} reference.
     * @param cleanCommandExecutor - {@link CommandExecutor} reference.
     * @param manifestReader - {@link AddOnManifestReader} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link BuildCommandExecutor} instance.
     */
    constructor(
        @inject(ITypes.ScriptManager) scriptManager: ScriptManager,
        @inject(ICoreTypes.Logger) logger: Logger,
        @inject(ITypes.CommandExecutor) @named("clean") cleanCommandExecutor: CommandExecutor,
        @inject(ITypes.AddOnManifestReader) manifestReader: AddOnManifestReader,
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService
    ) {
        this._scriptManager = scriptManager;
        this._logger = logger;
        this._cleanCommandExecutor = cleanCommandExecutor;
        this._manifestReader = manifestReader;
        this._analyticsService = analyticsService;
    }

    /**
     * Executes the command's handler.
     *
     * @param options - {@link BuildCommandOptions}.
     * @returns Promise.
     */
    async execute(options: BuildCommandOptions): Promise<boolean> {
        await this._validateSWCDependencies();
        await this._cleanCommandExecutor.execute();
        return this._build(options);
    }

    /**
     * Validate the Spectrum Web Components dependencies of the project.
     * Ensure that all @spectrum-web-components/* and @swc-react/* dependencies are using the same versions.
     */
    private async _validateSWCDependencies(): Promise<void> {
        const packageJsonPath = path.join(process.cwd(), "package.json");
        /*if (!fs.existsSync(packageJsonPath)) {
            return;
        }*/
        const packageJson = await fs.readJson(packageJsonPath);
        const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) } as Record<
            string,
            string
        >;

        const errors: string[] = [];
        const packagesToValidate = ["@spectrum-web-components/", "@swc-react/"];
        packagesToValidate.forEach(prefix => {
            this._validateDependencyGroup(dependencies, prefix, errors);
        });
        if (errors.length > 0) {
            this._logger.error(LOGS.swcDependenciesVersionMismatch);
            errors.forEach(error => this._logger.error(error));
            void this._analyticsService.postEvent(
                AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                LOGS.swcDependenciesVersionMismatch,
                false
            );
            process.exit(1);
        }
    }

    private _validateDependencyGroup(dependencies: Record<string, string>, prefix: string, errors: string[]): void {
        const versionToPackagesMap = new Map<string, string[]>();

        for (const [pkg, version] of Object.entries(dependencies)) {
            if (pkg.startsWith(prefix)) {
                const packages = versionToPackagesMap.get(version) || [];
                packages.push(pkg);
                versionToPackagesMap.set(version, packages);
            }
        }
        if (versionToPackagesMap.size > 1) {
            const versionDetails = Array.from(versionToPackagesMap.entries())
                .map(([version, packages]) => `- ${version}: ${packages.join(", ")}`)
                .join("\n");
            errors.push(`All ${prefix}* dependencies must use the same version. Found versions:\n${versionDetails}`);
        }
    }

    private _onValidationFailed = async (failedResult: ManifestValidationResult) => {
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
            void this._analyticsService.postEvent(
                AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                LOGS.manifestValidationFailed,
                false
            );
        }

        console.log();
        process.exit(1);
    };

    private async _build(options: BuildCommandOptions): Promise<boolean> {
        this._logger.information(
            format(LOGS.buildingSourceDirectory, {
                srcDirectory: options.srcDirectory,
                DEFAULT_OUTPUT_DIRECTORY
            })
        );

        let isBuildSuccessful = true;
        if (!isNullOrWhiteSpace(options.transpiler)) {
            isBuildSuccessful = await this._scriptManager.transpile(options.transpiler);
        } else {
            await this._scriptManager.copyStaticFiles(options.srcDirectory, DEFAULT_OUTPUT_DIRECTORY);
        }

        const addOnManifest = this._manifestReader.getManifest(this._onValidationFailed, false) as AddOnManifest;
        const addOnDirectory = new AddOnDirectory(options.srcDirectory, addOnManifest);

        if (isBuildSuccessful) {
            GlobalOverrides.overrideGlobalConsole(addOnManifest, addOnDirectory);
            this._logger.success(LOGS.done, { postfix: LOGS.newLine });
            const analyticsEventData = [
                "--addOnName",
                addOnDirectory.rootDirName,
                "--testId",
                addOnManifest.manifestProperties.testId,
                "--manifestVersion",
                addOnManifest.manifestProperties.manifestVersion,
                "--use",
                options.transpiler
            ];
            void this._analyticsService.postEvent(
                AnalyticsSuccessMarkers.SCRIPTS_BUILD_COMMAND_SUCCESS,
                analyticsEventData.join(" "),
                true
            );
        } else {
            void this._analyticsService.postEvent(
                AnalyticsErrorMarkers.SCRIPTS_BUILD_COMMAND_ERROR,
                LOGS.buildFailed,
                false
            );
        }

        return isBuildSuccessful;
    }
}

const LOGS = {
    newLine: "\n",
    buildingSourceDirectory: "Building source directory {srcDirectory}/ to {DEFAULT_OUTPUT_DIRECTORY}/ ...",
    done: "Done.",
    manifestValidationFailed: "Add-on manifest validation failed.",
    buildFailed: "Build Generation Failed.",
    swcDependenciesVersionMismatch: "Spectrum Web Components dependencies version mismatch."
};
