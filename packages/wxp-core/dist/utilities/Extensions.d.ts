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
 * Get JSON string representation of an item.
 * @param item - Unknown input.
 * @returns JSON string of item.
 */
export declare function getJSONString(item: unknown): string;
/**
 * Check whether a string value is null, undefined, empty or whitespace.
 * @param value - String input.
 * @returns Boolean value representing whether the string value is null, undefined, empty or whitespace.
 */
export declare function isNullOrWhiteSpace(value: string | null | undefined): boolean;
/**
 * Check whether a value is an object.
 * @param value - Value to check.
 * @returns Boolean value representing whether the value is an object.
 */
export declare function isObject(value: unknown): boolean;
/**
 * Recursively traverse a directory and execute an action on the underlying files.
 * @param directory - Directory to traverse.
 * @param action - Action to execute on the files.
 */
export declare function traverseDirectory(directory: string, action: (absolutePath: string) => unknown): void;
/**
 * Get Base URL.
 * @param protocol - Protocol.
 * @param host - Host (which is equivalent to Hostname:Port).
 * @returns Base URL as string.
 */
export declare function getBaseUrl(protocol: string, host: string): string;
/**
 * Remove symbols like `\n`, `\r` and `\t` from a string.
 * @param value - Value to remove symbols from.
 * @returns Value with symbols removed.
 */
export declare function removeSymbols(value: string): string;
/**
 * Check whether a path is of a file.
 * @param path - Path to check.
 * @returns Boolean value representing whether the path is of a file.
 */
export declare function isFile(path: string): boolean;
//# sourceMappingURL=Extensions.d.ts.map