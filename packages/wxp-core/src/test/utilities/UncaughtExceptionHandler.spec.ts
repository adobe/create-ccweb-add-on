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

import { assert } from "chai";
import "mocha";
import process from "process";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { IContainer, ITypes } from "../../config/index.js";
import type { Logger } from "../../utilities/Logger.js";
import { UncaughtExceptionHandler } from "../../utilities/UncaughtExceptionHandler.js";

describe("UncaughtExceptionHandler", () => {
    let sandbox: SinonSandbox;
    let logger: StubbedInstance<Logger>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        logger = stubInterface<Logger>();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("registerExceptionHandler", () => {
        it("should register a handler for an 'uncaughtException'.", () => {
            const processOnStub = sandbox.stub(process, "on");
            processOnStub.resolves();

            const programName = "test-program";
            UncaughtExceptionHandler.registerExceptionHandler(programName);

            assert.equal(processOnStub.getCall(0).args[0], "uncaughtException");
        });
    });

    describe("handleUncaughtException", () => {
        it("should log error and exit when an uncaught exception is encountered.", async () => {
            const processExitStub = sandbox.stub(process, "exit");
            processExitStub.resolves();

            logger.error.returns();

            const coreContainerStub = sandbox.stub(IContainer, "get");
            coreContainerStub.withArgs(ITypes.Logger).returns(logger);

            const programName = "test-program";
            const error = new Error("Unexpected error.");

            UncaughtExceptionHandler.handleUncaughtException(programName, error);

            assert.equal(
                logger.error.calledWith(`${programName} failed. Reason: ${error.message}`, { postfix: "\n" }),
                true
            );
            assert.equal(processExitStub.calledWith(0), true);
        });
    });
});
