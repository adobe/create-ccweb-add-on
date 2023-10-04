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
/// <reference types="node" />
import type { SetupCommandOptions } from "./SetupCommandOptions.js";
/**
 * Union of supported command options.
 */
export declare type CommandOptions = SetupCommandOptions;
/**
 * SSL setup option.
 */
export declare enum SSLSetupOption {
    Automatically = "automatically",
    Manually = "manually"
}
/**
 * SSL remove option.
 */
export declare enum SSLRemoveOption {
    Remove = "remove",
    Keep = "keep"
}
/**
 * SSL artifacts data.
 */
export declare type SSLData = {
    /**
     * SSL Certificate Data.
     */
    cert: string | Buffer;
    /**
     * SSL Key Data.
     */
    key: string | Buffer;
};
//# sourceMappingURL=Types.d.ts.map