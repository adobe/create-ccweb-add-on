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
import chalk from "chalk";
import "mocha";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { Logger } from "../../utilities/index.js";
import { ConsoleLogger } from "../../utilities/index.js";

describe("ConsoleLogger", () => {
    let sandbox: SinonSandbox;
    let logger: Logger;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        logger = new ConsoleLogger();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("message ...", () => {
        const runs = [{ message: "" }, { message: " " }, { message: "Information Message" }];
        runs.forEach(run => {
            it(`should log message: '${run.message}' in console.`, () => {
                const consoleLogStub = sandbox.stub(console, "log");
                logger.message(run.message);
                assert.equal(consoleLogStub.callCount, 1);
                sinon.assert.calledWith(consoleLogStub, sinon.match(run.message));
            });
        });
    });

    describe("information ...", () => {
        const runs = [
            { message: "" },
            { message: " " },
            { message: "Information Message" },
            { message: "Information Message", postfix: "\n" }
        ];
        runs.forEach(run => {
            it(`should log message: '${run.message}' in console.`, () => {
                const consoleLogStub = sandbox.stub(console, "log");

                logger.information(run.message, { postfix: run.postfix });

                let loggedMessage = run.message;
                if (run.postfix) {
                    loggedMessage = `${loggedMessage}${run.postfix}`;
                }

                assert.equal(consoleLogStub.callCount, 1);
                sinon.assert.calledWith(consoleLogStub, sinon.match(chalk.cyan.bold(loggedMessage)));
            });
        });
    });

    describe("success ...", () => {
        const runs = [
            { message: "" },
            { message: " " },
            { message: "Success Message" },
            { message: "Success Message", prefix: "\n" }
        ];
        runs.forEach(run => {
            it(`should log message: '${run.message}' in console.`, () => {
                const consoleLogStub = sandbox.stub(console, "log");

                logger.success(run.message, { prefix: run.prefix });

                let loggedMessage = run.message;
                if (run.prefix) {
                    loggedMessage = `${run.prefix}${run.message}`;
                }

                assert.equal(consoleLogStub.callCount, 1);
                sinon.assert.calledWith(consoleLogStub, sinon.match(chalk.green.bold(loggedMessage)));
            });
        });
    });

    describe("warning ...", () => {
        const runs = [
            { message: "" },
            { message: " " },
            { message: "Warning Message" },
            { message: "Warning Message", prefix: "[", postfix: "]" }
        ];
        runs.forEach(run => {
            it(`should log message: '${run.message}' in console.`, () => {
                const consoleLogStub = sandbox.stub(console, "log");

                logger.warning(run.message, { prefix: run.prefix, postfix: run.postfix });

                let loggedMessage = run.message;
                if (run.prefix) {
                    loggedMessage = `${run.prefix}${run.message}`;
                }

                if (run.postfix) {
                    loggedMessage = `${loggedMessage}${run.postfix}`;
                }

                assert.equal(consoleLogStub.callCount, 1);
                sinon.assert.calledWith(consoleLogStub, sinon.match(chalk.hex("#E59400").bold(loggedMessage)));
            });
        });
    });

    describe("error ...", () => {
        const runs = [
            { message: "" },
            { message: " " },
            { message: "Error Message" },
            { message: new Error("Error Message") },
            { message: new Error("Error Message"), prefix: "\n", postfix: "\n" }
        ];
        runs.forEach(run => {
            it(`should log message: '${run.message}' in console.`, () => {
                const consoleLogStub = sandbox.stub(console, "log");

                logger.error(run.message, { prefix: run.prefix, postfix: run.postfix });

                let consoleLogStubCount = 1;
                if (run.prefix) {
                    consoleLogStubCount++;
                    sinon.assert.calledWith(consoleLogStub, sinon.match(chalk.red(run.prefix)));
                }

                sinon.assert.calledWith(consoleLogStub, sinon.match(chalk.red(run.message)));

                if (run.postfix) {
                    consoleLogStubCount++;
                    sinon.assert.calledWith(consoleLogStub, sinon.match(chalk.red(run.prefix)));
                }

                assert.equal(consoleLogStub.callCount, consoleLogStubCount);
            });
        });
    });
});
