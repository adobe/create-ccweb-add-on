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
 * Execution result.
 */
export declare type ExecutionResult = {
    /**
     * Command which was executed.
     */
    command: string;
    /**
     * Whether the execution is successful.
     */
    isSuccessful: boolean;
    /**
     * Data returned from the execution, if any.
     */
    data?: string;
    /**
     * Error thrown during the execution, if any.
     */
    error?: unknown;
};
/**
 * Logger options.
 */
export declare type LoggerOptions = {
    /**
     * Prefix string.
     */
    prefix?: string;
    /**
     * Postfix string.
     */
    postfix?: string;
};
export declare type AddOnMetaData = {
    name: string;
};
export declare type AddOn = {
    localizedMetadata: AddOnMetaData;
};
export declare type Schema = {
    addonId: string;
    versionString: string;
    supportedLanguages: string[];
    supportedApps: string[];
    downloadUrl: string;
    addon: AddOn;
};
//# sourceMappingURL=Types.d.ts.map