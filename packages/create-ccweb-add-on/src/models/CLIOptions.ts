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

import type { EntrypointType } from "@adobe/ccweb-add-on-manifest";

/**
 * Class representing the user provided CLI options.
 */
export class CLIOptions {
    /**
     * Entrypoint type of the Add-on. Example: 'panel'.
     */
    readonly entrypointType: EntrypointType;

    /**
     * Name of the Add-on.
     */
    readonly addOnName: string;

    /**
     * Template name.
     */
    readonly templateName: string;

    /**
     * Verbose flag.
     */
    readonly verbose: boolean;

    /**
     * Instantiate {@link CLIOptions}.
     * @param entrypointType - Kind of the Add-on. For example: panel.
     * @param addOnName - Name of the Add-on.
     * @param templateName - Template name.
     * @param verbose - Verbose flag.
     * @returns Reference to a new {@link CLIOptions} instance.
     */
    constructor(entrypointType: EntrypointType, addOnName: string, templateName: string, verbose: boolean) {
        this.entrypointType = entrypointType;
        this.addOnName = addOnName;
        this.templateName = templateName;
        this.verbose = verbose;
    }
}
