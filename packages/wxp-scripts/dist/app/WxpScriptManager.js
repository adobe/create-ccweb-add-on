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
import { ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import path from "path";
import "reflect-metadata";
import { EXTENSIONS_TO_TRANSPILE, MANIFEST_JSON } from "../constants.js";
/**
 * Script manager implementation class to manage the Add-On script requirements.
 */
let WxpScriptManager = class WxpScriptManager {
    _process;
    /**
     * Instantiate {@link WxpScriptManager}.
     * @param cliProcess - {@link Process} reference.
     * @returns Reference to a new {@link WxpScriptManager} instance.
     */
    constructor(cliProcess) {
        this._process = cliProcess;
    }
    /**
     * Clean directory.
     * @param directory - Directory to clean.
     * @returns Promise.
     */
    async cleanDirectory(directory) {
        fs.removeSync(directory);
        fs.ensureDirSync(directory);
    }
    /**
     * Clean directory and add manifest.
     * @param directory - Directory to clean.
     * @param manifestJsonPath - Path to manifest.json.
     * @returns Promise.
     */
    async cleanDirectoryAndAddManifest(directory, manifestJsonPath) {
        await this.cleanDirectory(directory);
        fs.copyFileSync(manifestJsonPath, path.join(directory, MANIFEST_JSON), fs.constants.COPYFILE_EXCL);
    }
    /**
     * Transpile necessary files in a directory.
     * @param transpiler - Command to use for transpilation.
     * @returns Whether the transpilation was successful.
     */
    async transpile(transpiler) {
        const result = await this._process.execute(transpiler, [], { stdio: "inherit" });
        return result.isSuccessful;
    }
    /**
     * Copy static files.
     * @param sourceDirectory - Directory containing static files.
     * @param destinationDirectory - Directory where the static files need to be copied into.
     * @returns Promise.
     */
    async copyStaticFiles(sourceDirectory, destinationDirectory) {
        await fs.copy(sourceDirectory, destinationDirectory, {
            /* c8 ignore next 2 */
            /* Unreachable code since fs.copy is stubbed. */
            filter: src => !EXTENSIONS_TO_TRANSPILE.has(path.extname(src))
        });
    }
};
WxpScriptManager = __decorate([
    injectable(),
    __param(0, inject(ICoreTypes.Process)),
    __metadata("design:paramtypes", [Object])
], WxpScriptManager);
export { WxpScriptManager };
//# sourceMappingURL=WxpScriptManager.js.map