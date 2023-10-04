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
/**
 * Class representing the user provided CLI options for Build Command.
 */
export class BuildCommandOptions {
    /**
     * Source directory - where the code artifacts exist.
     */
    srcDirectory;
    /**
     * Command to use for transpilation.
     */
    transpiler;
    /**
     * Verbose flag.
     */
    verbose;
    /**
     * Instantiate {@link BuildCommandOptions}.
     * @param srcDirectory - Source directory - where the code artifacts exist.
     * @param transpiler - Command to use for transpilation.
     * @param verbose - Verbose flag.
     * @returns Reference to a new {@link BuildCommandOptions} instance.
     */
    constructor(srcDirectory, transpiler, verbose) {
        this.srcDirectory = srcDirectory;
        this.transpiler = transpiler;
        this.verbose = verbose;
    }
}
//# sourceMappingURL=BuildCommandOptions.js.map