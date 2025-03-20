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

import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import type { Logger } from "@adobe/ccweb-add-on-core";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { assert } from "chai";
import "mocha";
import process from "process";
import prompts from "prompts";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import { AddOnTemplateSelector } from "../../app/AddOnTemplateSelector.js";
import type { TemplateSelector } from "../../app/TemplateSelector.js";
import { ADD_ON_TEMPLATES, PROGRAM_NAME, WITH_DOCUMENT_SANDBOX } from "../../constants.js";
import { CLIOptions } from "../../models/index.js";

describe("AddOnTemplateSelector", () => {
    let sandbox: SinonSandbox;

    let logger: StubbedInstance<Logger>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    const templateChoices: { title: string; value: string }[] = [];
    for (const [id, description] of ADD_ON_TEMPLATES.entries()) {
        templateChoices.push({
            title: description,
            value: id
        });
    }

    const templateName = "javascript";

    describe("setupTemplate", () => {
        beforeEach(() => {
            sandbox = sinon.createSandbox();

            sandbox.stub(console, "log").returns();

            logger = stubInterface<Logger>();
            analyticsService = stubInterface<AnalyticsService>();
            analyticsService.postEvent.resolves();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("should return error if the Add-on entrypoint is not valid.", async () => {
            const processExitStub = sandbox.stub(process, "exit");
            const options = new CLIOptions(
                "test-add-on-entrypoint" as EntrypointType,
                "test-add-on",
                templateName,
                false
            );

            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);

            await templateSelector.setupTemplate(options);

            assert.equal(logger.warning.callCount, 2);
            assert.equal(
                logger.warning
                    .getCall(0)
                    .calledWith("Please choose a valid Add-on entrypoint (valid entrypoint: panel)"),
                true
            );
            assert.equal(
                logger.warning
                    .getCall(1)
                    .calledWith(`${PROGRAM_NAME} <add-on-name> --entrypoint <panel>`, { prefix: "  " }),
                true
            );

            assert.equal(logger.message.callCount, 1);
            assert.equal(logger.message.calledWith("For example:", { prefix: "\n" }), true);

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information.calledWith(`${PROGRAM_NAME} my-add-on --entrypoint panel`, {
                    prefix: "  "
                }),
                true
            );
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.ERROR_INVALID_KIND,
                    "Invalid Add-on entrypoint specified"
                ),
                true
            );
            assert.equal(processExitStub.calledWith(0), true);
        });

        it("should return error if the app entrypoint is not valid.", async () => {
            const processExitStub = sandbox.stub(process, "exit");

            const cliOptions = new CLIOptions(
                "test-add-on-entrypoint" as EntrypointType,
                "test-add-on",
                templateName,
                false
            );

            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);
            await templateSelector.setupTemplate(cliOptions);

            assert.equal(logger.warning.callCount, 2);
            assert.equal(
                logger.warning
                    .getCall(0)
                    .calledWith("Please choose a valid Add-on entrypoint (valid entrypoint: panel)"),
                true
            );
            assert.equal(
                logger.warning
                    .getCall(1)
                    .calledWith(`${PROGRAM_NAME} <add-on-name> --entrypoint <panel>`, { prefix: "  " }),
                true
            );

            assert.equal(logger.message.callCount, 1);
            assert.equal(logger.message.calledWith("For example:", { prefix: "\n" }), true);

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information.calledWith(`${PROGRAM_NAME} my-add-on --entrypoint panel`, {
                    prefix: "  "
                }),
                true
            );
            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsErrorMarkers.ERROR_INVALID_KIND,
                    "Invalid Add-on entrypoint specified"
                ),
                true
            );
            assert.equal(processExitStub.calledWith(0), true);
        });

        it("should return the passed template name if present in CLIOptions and is a valid one.", async () => {
            const cliOptions = new CLIOptions(EntrypointType.PANEL, "test-app", templateName, false);

            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);
            const template = await templateSelector.setupTemplate(cliOptions);

            assert.equal(analyticsService.postEvent.callCount, 0);
            assert.equal(template, cliOptions.templateName);
        });

        it("should ask the user to select template name if an invalid templateName is present in CLIOptions.", async () => {
            const documentSandboxChoices = [
                {
                    title: "No",
                    value: false
                },
                {
                    title: "Yes",
                    value: true
                }
            ];

            const promptsStub = sandbox.stub(prompts, "prompt");
            promptsStub.resolves({
                selectedTemplate: templateChoices[1].value,
                includeDocumentSandbox: documentSandboxChoices[0].value
            });

            const cliOptions = new CLIOptions(EntrypointType.PANEL, "test-app", "incorrect-template", false);

            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);
            const template = await templateSelector.setupTemplate(cliOptions);

            assert.equal(template, templateChoices[1].value);
            assert.equal(logger.warning.callCount, 1);
            assert.equal(logger.warning.calledWith("You have chosen an invalid template.", { prefix: "\n" }), true);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });

        it("should prompt the user to select template if not present in CLIOptions.", async () => {
            const documentSandboxChoices = [
                {
                    title: "No",
                    value: false
                },
                {
                    title: "Yes",
                    value: true
                }
            ];

            const promptsStub = sandbox.stub(prompts, "prompt");
            promptsStub.resolves({
                selectedTemplate: templateChoices[1].value,
                includeDocumentSandbox: documentSandboxChoices[0].value
            });

            const cliOptions = new CLIOptions(EntrypointType.PANEL, "test-app", "", false);
            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);
            const template = await templateSelector.setupTemplate(cliOptions);

            assert.equal(logger.warning.callCount, 0);
            assert.equal(template, templateChoices[1].value);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });

        it("should return the template name when document sandbox is included.", async () => {
            const documentSandboxChoices = [
                {
                    title: "No",
                    value: false
                },
                {
                    title: "Yes",
                    value: true
                }
            ];

            const promptsStub = sandbox.stub(prompts, "prompt");
            promptsStub.resolves({
                selectedTemplate: templateChoices[1].value,
                includeDocumentSandbox: documentSandboxChoices[1].value
            });

            const cliOptions = new CLIOptions(EntrypointType.PANEL, "test-app", "", false);

            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);
            const template = await templateSelector.setupTemplate(cliOptions);

            assert.equal(logger.warning.callCount, 0);
            assert.equal(template, templateChoices[1].value + `-${WITH_DOCUMENT_SANDBOX}`);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });

        it("should exit if user doesnt select any prompted value and template is not passed.", async () => {
            const promptsStub = sandbox.stub(prompts, "prompt");
            const exitProcessStub = sandbox.stub(process, "exit");
            promptsStub.resolves({ selectedTemplate: undefined });

            const cliOptions = new CLIOptions(EntrypointType.PANEL, "test-app", "", false);

            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);
            await templateSelector.setupTemplate(cliOptions);

            assert.equal(logger.warning.callCount, 0);
            assert.equal(exitProcessStub.calledWith(0), true);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });

        it("should exit if user doesnt select any option in document sandbox prompt.", async () => {
            const promptsStub = sandbox.stub(prompts, "prompt");
            const exitProcessStub = sandbox.stub(process, "exit");
            promptsStub.resolves({ selectedTemplate: templateChoices[1].value, includeDocumentSandbox: undefined });

            const cliOptions = new CLIOptions(EntrypointType.PANEL, "test-app", "", false);

            const templateSelector: TemplateSelector = new AddOnTemplateSelector(logger, analyticsService);
            await templateSelector.setupTemplate(cliOptions);

            assert.equal(logger.warning.callCount, 0);
            assert.equal(exitProcessStub.calledWith(0), true);
            assert.equal(analyticsService.postEvent.callCount, 0);
        });
    });
});
