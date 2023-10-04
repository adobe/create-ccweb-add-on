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
import { inject, injectable } from "inversify";
import process from "process";
import "reflect-metadata";
import semver from "semver";
import format from "string-template";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import { PROGRAM_NAME } from "../constants.js";
/**
 * Environment validator implementation class to validate
 * the system requirements required for running the app.
 */
let NodeEnvironmentValidator = class NodeEnvironmentValidator {
    _process;
    _logger;
    _analyticsService;
    /**
     * Instantiate {@link NodeEnvironmentValidator}.
     *
     * @param processHandler - {@link Process} reference.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link NodeEnvironmentValidator} instance.
     */
    constructor(processHandler, logger, analyticsService) {
        this._process = processHandler;
        this._logger = logger;
        this._analyticsService = analyticsService;
    }
    /**
     * Validate the node version in the user's system.
     */
    async validateNodeVersion() {
        const minNode = "16.0.0";
        try {
            const result = this._process.executeSync("node", ["--version"]);
            const nodeVersion = String(result?.data)?.trim();
            const hasMinNode = semver.gte(nodeVersion, minNode);
            if (!hasMinNode) {
                this._logger.warning(format(LOGS.usingNodeVersion, { nodeVersion }));
                this._logger.information(format(LOGS.requiresHigherNode, {
                    PROGRAM_NAME,
                    minNode
                }));
                this._logger.information(LOGS.updateNodeVersion);
                await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_INVALID_NODE, format(LOGS.analyticsInvalidNode, { nodeVersion }), false);
                return process.exit(0);
            }
        }
        catch (error) {
            this._process.handleError(error);
        }
    }
    /**
     * Validate the npm version in the user's system.
     */
    async validateNpmVersion() {
        const minNpm = "8.0.0";
        try {
            const result = this._process.executeSync("npm", ["--version"]);
            const npmVersion = result.data ? String(result.data)?.trim() : undefined;
            if (!npmVersion) {
                this._logger.warning(LOGS.notUsingNpm);
                this._logger.information(format(LOGS.requiresHigherNpm, {
                    PROGRAM_NAME,
                    minNpm
                }));
                this._logger.information(LOGS.installNpm);
                await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_NO_NPM, LOGS.analyticsNoNpm, false);
                return process.exit(0);
            }
            const hasMinNpm = semver.gte(npmVersion, minNpm);
            if (!hasMinNpm) {
                this._logger.warning(format(LOGS.usingNpmVersion, { npmVersion }));
                this._logger.information(format(LOGS.requiresHigherNpm, {
                    PROGRAM_NAME,
                    minNpm
                }));
                this._logger.information(LOGS.updateNpm);
                await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_INVALID_NPM, format(LOGS.analyticsInvalidNpm, { npmVersion }), false);
                return process.exit(0);
            }
        }
        catch (error) {
            this._process.handleError(error);
        }
    }
    /**
     * Validate the npm configuration in the user's system.
     */
    async validateNpmConfiguration() {
        try {
            const cwd = process.cwd();
            const configList = this._process.executeSync("npm", ["config", "list"])?.data;
            if (!configList) {
                return;
            }
            const prefix = "; cwd = ";
            const configLines = configList.split("\n");
            const cwdLine = configLines.find(line => line.startsWith(prefix));
            if (!cwdLine) {
                return;
            }
            const npmCWD = cwdLine.substring(prefix.length);
            if (npmCWD === cwd) {
                return;
            }
            this._logger.warning(LOGS.couldNotStartNpmProcess);
            this._logger.information(format(LOGS.currentDirectory, { cwd }));
            this._logger.information(format(LOGS.newNpmProcessRunsIn, { npmCWD }));
            this._logger.information(LOGS.misconfiguredTerminalShell);
            await this._analyticsService.postEvent(AnalyticsErrorMarkers.ERROR_NPM_NOT_STARTED, LOGS.analyticsNotStartNpm, false);
            return process.exit(0);
        }
        catch (error) {
            return;
        }
    }
};
NodeEnvironmentValidator = __decorate([
    injectable(),
    __param(0, inject(ICoreTypes.Process)),
    __param(1, inject(ICoreTypes.Logger)),
    __param(2, inject(IAnalyticsTypes.AnalyticsService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], NodeEnvironmentValidator);
export { NodeEnvironmentValidator };
const LOGS = {
    newLine: "\n",
    tab: "  ",
    usingNodeVersion: "You are using node {nodeVersion}.",
    requiresHigherNode: "{PROGRAM_NAME} requires node {minNode} or higher.",
    updateNodeVersion: "Please update your version of node.",
    notUsingNpm: "You are not using npm.",
    requiresHigherNpm: "{PROGRAM_NAME} requires npm {minNpm} or higher.",
    installNpm: "Please install npm.",
    usingNpmVersion: "You are using npm {npmVersion}.",
    updateNpm: "Please update your version of npm.",
    couldNotStartNpmProcess: "Could not start an npm process in the right directory.",
    currentDirectory: "The current directory is: {cwd}",
    newNpmProcessRunsIn: "However, a newly started npm process runs in: {npmCWD}",
    misconfiguredTerminalShell: "This is probably caused by a misconfigured system terminal shell.",
    analyticsInvalidNode: "Invalid node version: {nodeVersion}",
    analyticsNoNpm: "npm is not present",
    analyticsInvalidNpm: "Invalid npm version: {npmVersion}",
    analyticsNotStartNpm: "npm process could not be started"
};
//# sourceMappingURL=NodeEnvironmentValidator.js.map