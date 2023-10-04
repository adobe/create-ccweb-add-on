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
 * Class representing template.json.
 */
export class TemplateJson {
    /**
     * dependencies property.
     */
    dependencies?: Map<string, string>;

    /**
     * devDependencies property.
     */
    devDependencies?: Map<string, string>;

    /**
     * scripts property.
     */
    scripts?: Map<string, string>;

    /**
     * Instantiate {@link TemplateJson}.
     *
     * @param content - template.json content.
     * @returns Reference to a new {@link TemplateJson} instance.
     */
    constructor(content: { [k: string]: unknown }) {
        this._setDependencies(content);
        this._setDevDependencies(content);
        this._setScripts(content);
    }

    private _setDependencies(content: { [k: string]: unknown }) {
        if (content.dependencies) {
            if (content.dependencies instanceof Map) {
                content.dependencies.forEach((value: string, key: string) => {
                    if (!this.dependencies) {
                        this.dependencies = new Map<string, string>();
                    }

                    this.dependencies.set(key, value);
                });
            } else if (content.dependencies instanceof Object) {
                for (const [key, value] of Object.entries(content.dependencies)) {
                    if (!this.dependencies) {
                        this.dependencies = new Map<string, string>();
                    }

                    this.dependencies.set(key, value.toString());
                }
            }
        }
    }

    private _setDevDependencies(content: { [k: string]: unknown }) {
        if (content.devDependencies) {
            if (content.devDependencies instanceof Map) {
                content.devDependencies.forEach((value: string, key: string) => {
                    if (!this.devDependencies) {
                        this.devDependencies = new Map<string, string>();
                    }

                    this.devDependencies.set(key, value);
                });
            } else if (content.devDependencies instanceof Object) {
                for (const [key, value] of Object.entries(content.devDependencies)) {
                    if (!this.devDependencies) {
                        this.devDependencies = new Map<string, string>();
                    }

                    this.devDependencies.set(key, value.toString());
                }
            }
        }
    }

    private _setScripts(content: { [k: string]: unknown }) {
        if (content.scripts) {
            if (content.scripts instanceof Map) {
                content.scripts.forEach((value: string, key: string) => {
                    if (!this.scripts) {
                        this.scripts = new Map<string, string>();
                    }

                    this.scripts.set(key, value);
                });
            } else if (content.scripts instanceof Object) {
                for (const [key, value] of Object.entries(content.scripts)) {
                    if (!this.scripts) {
                        this.scripts = new Map<string, string>();
                    }

                    this.scripts.set(key, value.toString());
                }
            }
        }
    }
}
