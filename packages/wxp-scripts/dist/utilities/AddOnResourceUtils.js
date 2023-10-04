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
import { DEFAULT_OUTPUT_DIRECTORY, traverseDirectory } from "@adobe/ccweb-add-on-core";
import path from "path";
import { URL } from "url";
import { DEFAULT_ADD_ON_NAME, MANIFEST_JSON } from "../constants.js";
/**
 * Class containing utility functions for Add-ons.
 */
export class AddOnResourceUtils {
    /**
     * Get Add-on schema details as an array.
     * @param manifest - {@link AddOnManifest} Information about the Add-on.
     * @param baseUrl - Base URL of the server.
     * @returns Array of {@link AddOnSchema}
     */
    static getAddOns(manifest, addOnDirectory, baseUrl) {
        // fallback to previously stored manifest incase manifest validation fails
        const testId = manifest?.manifestProperties.testId ??
            addOnDirectory.manifest?.manifestProperties.testId;
        const addOnName = manifest?.manifestProperties?.name ?? DEFAULT_ADD_ON_NAME;
        return [
            {
                addonId: testId,
                versionString: manifest?.version ?? addOnDirectory.manifest?.manifestProperties.version,
                supportedLanguages: ["en-US"],
                supportedApps: ["Express"],
                downloadUrl: `${baseUrl}${testId}/${MANIFEST_JSON}`,
                addon: {
                    localizedMetadata: {
                        name: addOnName
                    }
                }
            }
        ];
    }
    /**
     * Get all Add-on resources from the build directory.
     * @param manifest - {@link AddOnManifest} Information about the Add-on.
     * @param rootDirPath - Add-on Root directory path
     * @param baseUrl - Base URL of the server.
     * @returns Array of URLs as string pointing to the Add-on resources.
     */
    static getResources(manifest, rootDirPath, baseUrl) {
        const resources = [];
        const outputDirectory = path.join(rootDirPath, DEFAULT_OUTPUT_DIRECTORY);
        traverseDirectory(outputDirectory, absolutePath => {
            // ignore dotfiles
            if (!path.basename(absolutePath).startsWith(".")) {
                const relativePath = path.relative(outputDirectory, absolutePath);
                const resourcePath = path.join(manifest?.manifestProperties.testId, relativePath);
                const resourceUrl = new URL(resourcePath, baseUrl).href;
                resources.push(resourceUrl);
            }
        });
        return resources;
    }
}
//# sourceMappingURL=AddOnResourceUtils.js.map