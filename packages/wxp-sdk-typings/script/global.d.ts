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
 * Here are various global objects and Web APIs available for use in script code.
 * Please note, script runtime exposes only a subset of functionalities
 * exposed by standard Web APIs.
 */
declare global {
    var console: Console;

    interface Console {
        log(msg?: any, ...subst: any[]): void;
        info(msg?: any, ...subst: any[]): void;
        warn(msg?: any, ...subst: any[]): void;
        error(msg?: any, ...subst: any[]): void;
        debug(msg?: any, ...subst: any[]): void;
        clear(): void;
        assert(assertion?: boolean, msg?: string, ...subst: any[]): void;
    }

    function setTimeout(functionRef: Function, delay: number, ...params: any[]): number;
    function clearTimeout(timeoutID: number): void;
    function setInterval(functionRef: Function, delay: number, ...params: any[]): number;
    function clearInterval(intervalID: number): void;

    interface Blob {
        readonly size: number;
        readonly type: string;
        arrayBuffer(): Promise<ArrayBuffer>;
        slice(start?: number, end?: number, contentType?: string): Blob;
        text(): Promise<string>;
    }

    var Blob: {
        prototype: Blob;
        new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
    };
}

export {};
