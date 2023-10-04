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
import "reflect-metadata";
import type { PackageCommandOptions } from "../models/PackageCommandOptions.js";
import type { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import type { CommandExecutor } from "./CommandExecutor.js";
/**
 * Package command executor.
 */
export declare class PackageCommandExecutor implements CommandExecutor {
    private readonly _buildCommandExecutor;
    private readonly _logger;
    private readonly _manifestReader;
    /**
     * Instantiate {@link PackageCommandExecutor}.
     *
     * @param buildCommandExecutor - {@link CommandExecutor} reference.
     * @param logger - {@link Logger} reference.
     * @param manifestReader - {@link AddOnManifestReader} reference.
     * @returns Reference to a new {@link PackageCommandExecutor} instance.
     */
    constructor(buildCommandExecutor: CommandExecutor, logger: Logger, manifestReader: AddOnManifestReader);
    /**
     * Creates a package of the dist folder.
     *
     * @param options - {@link PackageCommandOptions}.
     * @returns Promise.
     */
    execute(options: PackageCommandOptions): Promise<void>;
    private _onValidationFailed;
    private _packageContent;
}
//# sourceMappingURL=PackageCommandExecutor.d.ts.map