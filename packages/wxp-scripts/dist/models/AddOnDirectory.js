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
import path from "path";
import process from "process";
/**
 * Add-on directory information on which the script is executed.
 */
export class AddOnDirectory {
    /**
     * Add-on source directory name.
     */
    srcDirName;
    /**
     * Absolute path of the Add-on source directory.
     */
    srcDirPath;
    /**
     * Add-on directory name.
     */
    rootDirName;
    /**
     * Absolute path of the Add-on directory.
     */
    rootDirPath;
    /**
     * Add-on manifest, represented as {@link AddOnManifest}.
     */
    manifest;
    /**
     * Instantiate {@link AddOnDirectory}.
     * @param srcDirName - Add-on source directory name.
     * @param manifest - Add-on manifest, represented as {@link AddOnManifest}.
     * @returns Reference to a new {@link AddOnDirectory} instance.
     */
    constructor(srcDirName, manifest) {
        this.srcDirName = srcDirName;
        this.manifest = manifest;
        const currentDirectory = process.cwd();
        this.rootDirName = path.basename(currentDirectory);
        /* c8 ignore next 2 */
        /* path.resolve() cannot be stubbed */
        this.rootDirPath = path.isAbsolute(srcDirName) ? path.resolve(srcDirName, "..") : currentDirectory;
        this.srcDirPath = path.join(this.rootDirPath, this.srcDirName);
    }
}
//# sourceMappingURL=AddOnDirectory.js.map