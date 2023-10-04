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

/* eslint-disable camelcase -- child_process is the name of the module */
import { assert } from "chai";
import type { ChildProcess, ExecSyncOptions, SpawnSyncReturns } from "child_process";
import child_process from "cross-spawn";
import EventEmitter from "events";
import type { Dirent } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import path from "path";
import process from "process";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { ExecutionResult } from "../../models/Types.js";
import type { Logger, Process } from "../../utilities/index.js";
import { CLIProcess } from "../../utilities/index.js";

describe("CLIProcess", () => {
    let sandbox: SinonSandbox;
    let logger: StubbedInstance<Logger>;
    let cliProcess: Process;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        logger = stubInterface<Logger>();
        cliProcess = new CLIProcess(logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("execute ...", () => {
        const runs = [
            { command: "some command", args: [] },
            { command: "some command", args: ["arg"] },
            { command: "some command", args: ["arg-1", "arg-2"] },
            { command: "some command", args: ["arg"], options: { stdio: "inherit" } }
        ];
        runs.forEach(run => {
            it(`should call spawn() on ${run.command} with ${run.args?.length ?? 0} argument(s) and ${
                run.options ? "" : "no "
            }options.`, () => {
                const spawnStub = sandbox.stub(child_process, "spawn");

                const options = run.options as ExecSyncOptions;
                if (options) {
                    cliProcess.execute(run.command, run.args, options);
                } else {
                    cliProcess.execute(run.command, run.args);
                }

                assert.equal(spawnStub.callCount, 1);

                if (options) {
                    assert.equal(spawnStub.calledWith(run.command, run.args, run.options as ExecSyncOptions), true);
                } else {
                    assert.equal(spawnStub.calledWith(run.command, run.args), true);
                }
            });
        });

        it(`should return isSuccessful: true in ExecutionResult for successful execution of command.`, async () => {
            const childProcess = <ChildProcess>new EventEmitter();
            sandbox.stub(child_process, "spawn").returns(childProcess);

            const command = "some-command";
            const args = ["--some-option", "some-value"];
            const expectedResult = {
                command: "some-command --some-option some-value",
                isSuccessful: true
            } as ExecutionResult;

            const executedPromise = cliProcess.execute(command, args);
            childProcess.emit("close", 0);

            const result = await executedPromise;
            assert.equal(result.command, expectedResult.command);
            assert.equal(result.isSuccessful, expectedResult.isSuccessful);
        });

        it(`should return isSuccessful: false in ExecutionResult for failed execution of command.`, async () => {
            const childProcess = <ChildProcess>new EventEmitter();
            sandbox.stub(child_process, "spawn").returns(childProcess);

            const command = "some-command";
            const args = ["--some-option", "some-value"];
            const expectedError = {
                command: "some-command --some-option some-value",
                isSuccessful: false
            } as ExecutionResult;

            const executedPromise = cliProcess.execute(command, args);
            childProcess.emit("close", 1);

            const result = await executedPromise;
            assert.equal(result === undefined, false);
            assert.equal(result.command, expectedError.command);
            assert.equal(result.isSuccessful, expectedError.isSuccessful);
        });
    });

    describe("executeSync ...", () => {
        const runs = [
            { command: "some command", args: [] },
            { command: "some command", args: ["arg"] },
            { command: "some command", args: ["arg-1", "arg-2"] },
            { command: "some command", args: ["arg"], options: { stdio: "inherit" } }
        ];
        runs.forEach(run => {
            it(`should call sync() on ${run.command} with ${run.args?.length ?? 0} argument(s) and ${
                run.options ? "" : "no "
            }options.`, () => {
                const syncStub = sandbox.stub(child_process, "sync").returns({
                    output: ["success"],
                    pid: 100,
                    signal: null,
                    stdout: "",
                    stderr: "",
                    status: 0
                } as SpawnSyncReturns<string>);

                const options = run.options as ExecSyncOptions;
                if (options) {
                    cliProcess.executeSync(run.command, run.args, options);
                } else {
                    cliProcess.executeSync(run.command, run.args);
                }

                assert.equal(syncStub.callCount, 1);

                if (options) {
                    assert.equal(syncStub.calledWith(run.command, run.args, run.options as ExecSyncOptions), true);
                } else {
                    assert.equal(syncStub.calledWith(run.command, run.args), true);
                }
            });
        });

        it(`should return isSuccessful: true in ExecutionResult for successful execution of command.`, () => {
            sandbox.stub(child_process, "sync").returns({
                output: ["successfully", "executed", "some-command"],
                pid: 100,
                signal: null,
                stdout: "",
                stderr: "",
                status: 0
            } as SpawnSyncReturns<string>);

            const command = "some-command";
            const args = ["--some-option", "some-value"];
            const expectedResult = {
                command: "some-command --some-option some-value",
                isSuccessful: true,
                data: "successfullyexecutedsome-command"
            };

            const result = cliProcess.executeSync(command, args);

            assert.equal(result.command, expectedResult.command);
            assert.equal(result.isSuccessful, expectedResult.isSuccessful);
            assert.equal(result.data, expectedResult.data);
        });

        it(`should return isSuccessful: false in ExecutionResult for failed execution of command.`, () => {
            const error = new Error("Injected failure.");
            sandbox.stub(child_process, "sync").throws(error);

            const command = "some-command";
            const args = ["--some-option", "some-value"];
            const expectedError = {
                command: "some-command --some-option some-value",
                isSuccessful: false,
                error
            };

            try {
                cliProcess.executeSync(command, args);
            } catch (error: unknown) {
                const executionError = error as ExecutionResult;
                assert.equal(executionError === undefined, false);
                assert.equal(executionError.command, expectedError.command);
                assert.equal(executionError.isSuccessful, expectedError.isSuccessful);
                assert.equal(executionError.error, expectedError.error);
            }
        });
    });

    describe("handleError ...", () => {
        it(`should only log "Aborting installation" if error is undefined.`, () => {
            cliProcess.handleError(undefined);

            assert.equal(logger.error.callCount, 1);
            assert.equal(logger.error.calledWith("Aborting installation.", { prefix: "\n" }), true);
        });

        it(`should log command if error has a non-empty command property.`, () => {
            const command = "some-failing-command";
            cliProcess.handleError({ command });

            assert.equal(logger.error.callCount, 1);
            assert.equal(logger.error.calledWith("Aborting installation.", { prefix: "\n" }), true);

            assert.equal(logger.warning.callCount, 1);
            assert.equal(
                logger.warning.calledWith(`${command} has failed.`, {
                    prefix: "  ",
                    postfix: "\n"
                }),
                true
            );
        });

        it(`should log "Unexpected error" if error does not have a command property.`, () => {
            const error = new Error("Injected failure.");
            cliProcess.handleError(error);

            assert.equal(logger.error.callCount, 3);
            assert.equal(logger.error.getCall(0).calledWith("Aborting installation."), true);
            assert.equal(logger.error.getCall(1).calledWith("Unexpected error. Please report it as a bug:"), true);
            assert.equal(logger.error.getCall(2).calledWith(error), true);
        });
    });

    describe("removeAddOn ...", () => {
        const runs = [
            {},
            { addOnName: "hello-world", addOnDirectory: undefined },
            { addOnName: "", addOnDirectory: "/../hello-world" },
            { addOnName: undefined, addOnDirectory: undefined }
        ];
        runs.forEach(run => {
            it(`should exit if addOnName or addOnDirectory is undefined.`, () => {
                const processStub = sandbox.stub(process, "exit");

                cliProcess.removeAddOn(run.addOnDirectory, run.addOnName);

                assert.equal(processStub.callCount, 1);
                assert.equal(processStub.calledWith(0), true);
            });
        });

        it(`should remove known generated files along with addOnDirectory when no other files are present.`, () => {
            const addOnName = "hello-world";
            const addOnDirectory = "/../hello-world";

            const pathJoinStub = sandbox.stub(path, "join");
            const addOnDirectoryPath = "../../joined-path";
            pathJoinStub.withArgs(addOnDirectory).returns(addOnDirectoryPath);

            const readDirStub = sandbox.stub(fs, "readdirSync");
            const addOnFiles = [
                { name: "package.json" },
                { name: "package-lock.json" },
                { name: "node_modules" }
            ] as Dirent[];
            readDirStub.withArgs(addOnDirectoryPath, { withFileTypes: true }).returns(addOnFiles);

            const removeStub = sandbox.stub(fs, "removeSync");

            const pathResolveStub = sandbox.stub(path, "resolve");
            pathResolveStub.returns("../../resolved-path");

            const changeDirStub = sandbox.stub(process, "chdir");

            cliProcess.removeAddOn(addOnDirectory, addOnName);

            assert.equal(pathJoinStub.callCount, 4);
            assert.equal(readDirStub.callCount, 1);
            assert.equal(logger.information.callCount, 4);
            assert.equal(logger.warning.callCount, 1);

            assert.equal(logger.information.calledWith(`Deleting generated file/directory package.json ...`), true);

            assert.equal(
                logger.information.calledWith(`Deleting generated file/directory package-lock.json ...`),
                true
            );

            assert.equal(logger.information.calledWith(`Deleting generated file/directory node_modules ...`), true);

            assert.equal(logger.information.calledWith(`Deleting ${addOnName}/ from ../../resolved-path`), true);

            assert.equal(logger.warning.calledWith("Done."), true);

            assert.equal(removeStub.callCount, 4);
            assert.equal(pathResolveStub.callCount, 1);
            assert.equal(changeDirStub.callCount, 1);
        });

        it(`should only remove known generated files when other files are present.`, () => {
            const addOnName = "hello-world";
            const addOnDirectory = "/../hello-world";

            const pathJoinStub = sandbox.stub(path, "join");
            const addOnDirectoryPath = "../../joined-path";
            pathJoinStub.withArgs(addOnDirectory).returns(addOnDirectoryPath);

            const readDirStub = sandbox.stub(fs, "readdirSync");
            const addOnFiles = [
                { name: "package.json" },
                { name: "package-lock.json" },
                { name: "node_modules" },
                { name: "xyz" }
            ] as Dirent[];
            readDirStub.withArgs(addOnDirectoryPath, { withFileTypes: true }).returns(addOnFiles);

            const removeStub = sandbox.stub(fs, "removeSync");

            const pathResolveStub = sandbox.stub(path, "resolve");
            pathResolveStub.returns("../../resolved-path");

            const changeDirStub = sandbox.stub(process, "chdir");

            cliProcess.removeAddOn(addOnDirectory, addOnName);

            assert.equal(pathJoinStub.callCount, 4);
            assert.equal(readDirStub.callCount, 1);
            assert.equal(logger.information.callCount, 3);
            assert.equal(logger.warning.callCount, 1);

            assert.equal(logger.information.calledWith(`Deleting generated file/directory package.json ...`), true);

            assert.equal(
                logger.information.calledWith(`Deleting generated file/directory package-lock.json ...`),
                true
            );

            assert.equal(logger.information.calledWith(`Deleting generated file/directory node_modules ...`), true);

            assert.equal(logger.warning.calledWith("Done."), true);

            assert.equal(removeStub.callCount, 3);
            assert.equal(pathResolveStub.callCount, 0);
            assert.equal(changeDirStub.callCount, 0);
        });
    });
});
