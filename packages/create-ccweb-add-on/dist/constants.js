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
export const ADD_ON_TEMPLATES = new Map([
    ["javascript", "Get started with Add-on development using JavaScript"],
    ["typescript", "Get started with Add-on development using TypeScript"],
    ["react-javascript", "Get started with Add-on development using React and JavaScript"],
    ["react-typescript", "Get started with Add-on development using React and TypeScript"]
]);
export const TEMP_TEMPLATE_PATH = ".template";
export const WITH_SCRIPT_RUNTIME = "with-script-runtime";
export const AVAILABLE_ADD_ON_TEMPLATES = [
    "javascript",
    "typescript",
    "react-javascript",
    "react-typescript",
    `javascript-${WITH_SCRIPT_RUNTIME}`,
    `typescript-${WITH_SCRIPT_RUNTIME}`,
    `react-javascript-${WITH_SCRIPT_RUNTIME}`,
    `react-typescript-${WITH_SCRIPT_RUNTIME}`
];
//# sourceMappingURL=constants.js.map