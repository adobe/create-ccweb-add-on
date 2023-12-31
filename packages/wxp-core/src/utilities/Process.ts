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

import type { ExecSyncOptions } from "child_process";
import type { ExecutionResult } from "../models/index.js";

/**
 * Process interface for managing execution of commands.
 */
export interface Process {
    /**
     * Execute a command asynchronously.
     *
     * @param command - Command to execute.
     * @param args - Command arguments.
     * @param options - Execution {@link ExecSyncOptions} options.
     * @returns Promise of {@link ExecutionResult}.
     */
    execute(command: string, args: string[], options?: ExecSyncOptions): Promise<ExecutionResult>;

    /**
     * Execute a command synchronously.
     *
     * @param command - Command to execute.
     * @param args - Command arguments.
     * @param options - Execution {@link ExecSyncOptions} options.
     * @returns {@link ExecutionResult}.
     */
    executeSync(command: string, args: string[], options?: ExecSyncOptions): ExecutionResult;

    /**
     * Handle any error.
     *
     * @param error - Any error.
     */
    handleError(error: unknown): void;

    /**
     * Remove the created Add-on.
     *
     * @param addOnDirectory - Directory of the Add-on.
     * @param addOnName - Name of the Add-on.
     */
    removeAddOn(addOnDirectory?: string, addOnName?: string): void;
}
