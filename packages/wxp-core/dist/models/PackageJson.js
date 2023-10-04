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
import { getJSONString } from "../utilities/index.js";
import { TemplateJson } from "./TemplateJson.js";
/**
 * Class representing package.json.
 */
export class PackageJson extends TemplateJson {
    /**
     * name property.
     */
    name;
    /**
     * version property.
     */
    version;
    /**
     * description property.
     */
    description;
    /**
     * keywords property.
     */
    keywords;
    /**
     * Instantiate {@link PackageJson}.
     *
     * @param content - package.json content.
     * @returns Reference to a new {@link PackageJson} instance.
     */
    constructor(content) {
        super(content);
        this.name = content.name;
        this.version = content.version;
        this.description = content.description;
        this.keywords = content.keywords;
    }
    /**
     * Get JSON representation of this {@link PackageJson} reference.
     *
     * @returns JSON representation as string.
     */
    toJSON() {
        return getJSONString({
            name: this.name,
            version: this.version,
            description: this.description,
            scripts: this.scripts ? Object.fromEntries(this.scripts) : undefined,
            keywords: this.keywords,
            dependencies: this.dependencies ? Object.fromEntries(this.dependencies) : undefined,
            devDependencies: this.devDependencies ? Object.fromEntries(this.devDependencies) : undefined
        });
    }
}
//# sourceMappingURL=PackageJson.js.map