/********************************************************************************
 * MIT License
 *
 * © Copyright 2025 Adobe. All rights reserved.
 *
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

import { DEFAULT_OUTPUT_DIRECTORY } from "@adobe/ccweb-add-on-core";
import type { AddOnManifest } from "@adobe/ccweb-add-on-manifest";
import fs from "fs-extra";
import * as path from "path";
import format from "string-template";
import { CONSOLE_OVERRIDE_SCRIPT, CONSOLE_OVERRIDE_SCRIPT_NAME } from "../constants.js";
import type { AddOnDirectory } from "../models/AddOnDirectory.js";

/**
 * Utility class to override global objects.
 */
export class GlobalOverrides {
    /**
     * Inject a script into the build output directory to override the global `console` object to include the `[Add-on: {addOnName}]` prefix string in all add-on logs.
     * @param addOnManifest - {@link AddOnManifest}.
     * @param addOnDirectory - {@link AddOnDirectory}.
     */
    static overrideGlobalConsole(addOnManifest: AddOnManifest, addOnDirectory: AddOnDirectory): void {
        const addOnName = JSON.stringify(addOnManifest.name?.toString() ?? addOnDirectory.rootDirName);
        const scriptContent = format(CONSOLE_OVERRIDE_SCRIPT, {
            addOnName
        });
        const overrideScriptPath = path.join(process.cwd(), DEFAULT_OUTPUT_DIRECTORY, CONSOLE_OVERRIDE_SCRIPT_NAME);
        fs.writeFileSync(overrideScriptPath, scriptContent, "utf-8");
    }
}
