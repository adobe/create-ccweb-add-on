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
import type { Process } from "@adobe/ccweb-add-on-core";
import "reflect-metadata";
import type { ScriptManager } from "./ScriptManager.js";
/**
 * Script manager implementation class to manage the Add-On script requirements.
 */
export declare class WxpScriptManager implements ScriptManager {
    private readonly _process;
    /**
     * Instantiate {@link WxpScriptManager}.
     * @param cliProcess - {@link Process} reference.
     * @returns Reference to a new {@link WxpScriptManager} instance.
     */
    constructor(cliProcess: Process);
    /**
     * Clean directory.
     * @param directory - Directory to clean.
     * @returns Promise.
     */
    cleanDirectory(directory: string): Promise<void>;
    /**
     * Clean directory and add manifest.
     * @param directory - Directory to clean.
     * @param manifestJsonPath - Path to manifest.json.
     * @returns Promise.
     */
    cleanDirectoryAndAddManifest(directory: string, manifestJsonPath: string): Promise<void>;
    /**
     * Transpile necessary files in a directory.
     * @param transpiler - Command to use for transpilation.
     * @returns Whether the transpilation was successful.
     */
    transpile(transpiler: string): Promise<boolean>;
    /**
     * Copy static files.
     * @param sourceDirectory - Directory containing static files.
     * @param destinationDirectory - Directory where the static files need to be copied into.
     * @returns Promise.
     */
    copyStaticFiles(sourceDirectory: string, destinationDirectory: string): Promise<void>;
}
//# sourceMappingURL=WxpScriptManager.d.ts.map