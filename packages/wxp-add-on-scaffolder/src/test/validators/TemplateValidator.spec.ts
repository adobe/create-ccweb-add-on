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

import type { Logger } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import "mocha";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { PROGRAM_NAME } from "../../constants.js";
import { TemplateValidator } from "../../validators/TemplateValidator.js";

describe("AddOnTemplateValidator", () => {
    describe("validateTemplate ...", () => {
        let sandbox: SinonSandbox;
        let logger: StubbedInstance<Logger>;
        let validator: TemplateValidator;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            logger = stubInterface<Logger>();
            validator = new TemplateValidator(logger);
        });

        afterEach(() => {
            sandbox.restore();
        });

        let runs = [{ template: "" }, { template: " " }];
        runs.forEach(run => {
            it(`should exit for empty template: ${run.template}.`, () => {
                const processExitStub = sandbox.stub(process, "exit");

                validator.validateTemplate(run.template);

                assert.equal(logger.warning.callCount, 2);
                assert.equal(logger.warning.getCall(0).calledWith("Please specify a valid template name:"), true);
                assert.equal(
                    logger.warning
                        .getCall(1)
                        .calledWith(`${PROGRAM_NAME} --template <template-name>`, { prefix: "  " }),
                    true
                );

                assert.equal(logger.message.callCount, 1);
                assert.equal(
                    logger.message.calledWith("For example:", {
                        prefix: "\n"
                    }),
                    true
                );

                assert.equal(logger.information.callCount, 1);
                assert.equal(
                    logger.information.calledWith(`${PROGRAM_NAME} --template javascript`, { prefix: "  " }),
                    true
                );

                assert.equal(processExitStub.callCount, 1);
                assert.equal(processExitStub.calledWith(1), true);
            });
        });

        runs = [{ template: "javascript" }];
        runs.forEach(run => {
            it(`should return for non-empty template: ${run.template}.`, () => {
                const processExitStub = sandbox.stub(process, "exit");

                validator.validateTemplate(run.template);

                assert.equal(processExitStub.callCount, 0);
            });
        });
    });
});
