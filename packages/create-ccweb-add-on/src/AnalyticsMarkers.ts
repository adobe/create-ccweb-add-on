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

export enum AnalyticsSuccessMarkers {
    SUCCESS = "SUCCESS"
}

export enum AnalyticsErrorMarkers {
    ERROR_UNKNOWN_REASON = "ERROR_UNKNOWN_REASON",
    ERROR_INVALID_KIND = "ERROR_INVALID_KIND",
    ERROR_INVALID_ARGS = "ERROR_INVALID_ARGS",
    ERROR_NO_ADD_ON_NAME = "ERROR_NO_ADD_ON_NAME",
    ERROR_INVALID_NAME_NPM = "ERROR_INVALID_NAME_NPM",
    ERROR_INVALID_NAME_DEP = "ERROR_INVALID_NAME_DEP",
    ERROR_INVALID_NAME_DIR = "ERROR_INVALID_NAME_DIR",
    ERROR_INVALID_NODE = "ERROR_INVALID_NODE",
    ERROR_INVALID_NPM = "ERROR_INVALID_NPM",
    ERROR_NO_NPM = "ERROR_NO_NPM",
    ERROR_NPM_NOT_STARTED = "ERROR_NPM_NOT_STARTED"
}
