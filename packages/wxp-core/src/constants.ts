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

import path from "path";

export const DEFAULT_HOST_NAME = "localhost";
export const DEFAULT_PORT = "5241";
export const DEFAULT_ADD_ON_VERSION = "1.0.0";
export const DEFAULT_SRC_DIRECTORY = "src";
export const DEFAULT_OUTPUT_DIRECTORY = "dist";

export const CCWEB_ADDON_DIRECTORY = path.join("Adobe", "CCWebAddOn");
export const ADD_ON_PREFERENCES_FILE = "add-on-preferences.json";
export const ADDITIONAL_ADD_ON_INFO = {
    sourceId: "developerSource",
    privileged: true,
    isDeveloperAddOn: true
};

export const ALLOWED_HOSTNAMES = /[a-zA-Z]\.adobe.com$/;
