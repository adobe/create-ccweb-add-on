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

import type { ChildProcess, ExecSyncOptions, SpawnSyncReturns } from "child_process";
import childprocess from "cross-spawn";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import path from "path";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import { ITypes } from "../config/inversify.types.js";
import type { Logger } from "./Logger.js";
import type { ExecutionResult, Process } from "./Process.js";

/**
 * CLI Process implementation class for managing execution of commands.
 */
@injectable()
export class CLIProcess implements Process {
    private readonly _logger: Logger;

    /**
     * Instantiate {@link CLIProcess}.
     *
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link CLIProcess} instance.
     */
    constructor(@inject(ITypes.Logger) logger: Logger) {
        this._logger = logger;
    }

    /**
     * Execute a command asynchronously.
     *
     * @param command - Command to execute.
     * @param args - Command arguments.
     * @param options - Execution {@link ExecSyncOptions} options.
     * @returns Promise of {@link ExecutionResult}.
     */
    execute(command: string, args: string[], options?: ExecSyncOptions): Promise<ExecutionResult> {
        const commandWithArgs = args.length > 0 ? `${command} ${args.join(" ")}` : command;
        return new Promise(resolve => {
            let childProcess: ChildProcess;
            if (options) {
                childProcess = childprocess.spawn(command, args, options);
            } else {
                childProcess = childprocess.spawn(command, args);
            }

            childProcess.on("close", code => {
                if (code !== 0) {
                    resolve({
                        command: commandWithArgs,
                        isSuccessful: false
                    });

                    return;
                }

                resolve({
                    command: commandWithArgs,
                    isSuccessful: true
                });
            });
        });
    }

    /**
     * Execute a command synchronously.
     *
     * @param command - Command to execute.
     * @param args - Command arguments.
     * @param options - Execution {@link ExecSyncOptions} options.
     * @returns {@link ExecutionResult}.
     */
    executeSync(command: string, args: string[], options?: ExecSyncOptions): ExecutionResult {
        const commandWithArgs = args.length > 0 ? `${command} ${args.join(" ")}` : command;
        try {
            let result: SpawnSyncReturns<string | Buffer>;
            if (options) {
                result = childprocess.sync(command, args, options);
            } else {
                result = childprocess.sync(command, args);
            }

            return {
                command: commandWithArgs,
                isSuccessful: true,
                data: result.output.join("")
            };
        } catch (error: unknown) {
            // eslint-disable-next-line no-throw-literal -- throw the object causing the error.
            throw {
                command: commandWithArgs,
                isSuccessful: false,
                error
            };
        }
    }

    /**
     * Handle any error.
     *
     * @param error - Any error.
     */
    handleError(error: unknown): void {
        this._logger.error(LOGS.abortingInstallation, { prefix: LOGS.newLine });
        if (!error) {
            return;
        }

        const executionError = error as ExecutionResult;
        if (executionError && executionError.command) {
            this._logger.warning(format(LOGS.hasFailed, { command: executionError.command }), {
                prefix: LOGS.tab,
                postfix: LOGS.newLine
            });
        } else {
            this._logger.error(LOGS.unexpectedError);
            this._logger.error(error, { postfix: LOGS.newLine });
        }
    }

    /**
     * Remove the created Add-on.
     *
     * @param addOnDirectory - Directory of the Add-on.
     * @param addOnName - Name of the Add-on.
     */
    removeAddOn(addOnDirectory?: string, addOnName?: string): void {
        if (!addOnDirectory || !addOnName) {
            return process.exit(0);
        }

        const knownGeneratedFiles = new Set<string>([
            ".env",
            ".prettierignore",
            ".prettierrc.json",
            "node_modules",
            "package-lock.json",
            "package.json",
            "src",
            "ssl"
        ]);

        const addOnDirectoryPath = path.join(addOnDirectory);
        const currentFiles = fs.readdirSync(addOnDirectoryPath, { withFileTypes: true }).map(file => file.name);
        let remainingFiles = currentFiles.length;
        currentFiles.forEach(file => {
            if (knownGeneratedFiles.has(file)) {
                this._logger.information(format(LOGS.deletingGeneratedFileOrDirectory, { file }));
                fs.removeSync(path.join(addOnDirectory, file));
                remainingFiles--;
            }
        });

        if (remainingFiles === 0) {
            const rootDirectory = path.resolve(addOnDirectory, "..");
            this._logger.information(format(LOGS.deletingAddOn, { addOnName, rootDirectory }));
            process.chdir(rootDirectory);
            fs.removeSync(addOnDirectoryPath);
        }

        this._logger.warning(LOGS.done);
    }
}

const LOGS = {
    newLine: "\n",
    tab: "  ",
    abortingInstallation: "Aborting installation.",
    hasFailed: "{command} has failed.",
    unexpectedError: "Unexpected error. Please report it as a bug:",
    deletingGeneratedFileOrDirectory: "Deleting generated file/directory {file} ...",
    deletingAddOn: "Deleting {addOnName}/ from {rootDirectory}",
    done: "Done."
};
