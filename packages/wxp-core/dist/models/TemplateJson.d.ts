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
export declare class TemplateJson {
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
    constructor(content: {
        [k: string]: unknown;
    });
    private _setDependencies;
    private _setDevDependencies;
    private _setScripts;
}
//# sourceMappingURL=TemplateJson.d.ts.map