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

export const PROGRAM_NAME = "create-ccweb-add-on";

export const ADD_ON_TEMPLATES: Map<string, string> = new Map<string, string>([
    ["javascript", "Get started with Add-on development using JavaScript"],
    ["swc-javascript", "Get started with Add-on development using using Spectrum Web Components and JavaScript"],
    ["swc-typescript", "Get started with Add-on development using using Spectrum Web Components and TypeScript"],
    ["react-javascript", "Get started with Add-on development using React and JavaScript"],
    ["react-typescript", "Get started with Add-on development using React and TypeScript"]
]);

export const TEMP_TEMPLATE_PATH = ".template";

export const WITH_DOCUMENT_SANDBOX = "with-document-sandbox";

export const AVAILABLE_ADD_ON_TEMPLATES: string[] = [
    "javascript",
    "swc-javascript",
    "swc-typescript",
    "react-javascript",
    "react-typescript",
    `javascript-${WITH_DOCUMENT_SANDBOX}`,
    `swc-javascript-${WITH_DOCUMENT_SANDBOX}`,
    `swc-typescript-${WITH_DOCUMENT_SANDBOX}`,
    `react-javascript-${WITH_DOCUMENT_SANDBOX}`,
    `react-typescript-${WITH_DOCUMENT_SANDBOX}`
];
