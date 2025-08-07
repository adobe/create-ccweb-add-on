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

import process from "process";
import { IContainer, ITypes } from "../config/index.js";
import type { Logger } from "./Logger.js";

/**
 * Uncaught exception handler.
 */
export class UncaughtExceptionHandler {
    /**
     * Register handler for catching any uncaught exception.
     * @param programName - Program from where the exception could be thrown.
     */
    static registerExceptionHandler(programName: string): void {
        process.on("uncaughtException", error => this.handleUncaughtException(programName, error));
    }

    /**
     * Handle any uncaught exception thrown during execution.
     * @param programName - Program from where the exception could be thrown.
     * @param error - Uncaught exception.
     */
    static handleUncaughtException(programName: string, error: Error): void {
        const logger = IContainer.get<Logger>(ITypes.Logger);
        logger.error(`${programName} failed. Reason: ${error.message}`, { postfix: LOGS.newLine });
        return process.exit(0);
    }
}

const LOGS = {
    newLine: "\n"
};
