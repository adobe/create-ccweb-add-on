/********************************************************************************
 * MIT License

 * © Copyright 2025 Adobe. All rights reserved.

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
import type { Logger, UserPreferences } from "@adobe/ccweb-add-on-core";
import { PreferenceJson } from "@adobe/ccweb-add-on-core";
import devcert from "@adobe/ccweb-add-on-devcert";
import { assert } from "chai";
import chalk from "chalk";
import fs from "fs-extra";
import "mocha";
import path from "path";
import prompts from "prompts";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../../AnalyticsMarkers.js";
import type { CommandExecutor } from "../../app/CommandExecutor.js";
import { PurgeCommandExecutor } from "../../app/PurgeCommandExecutor.js";
import { SSLRemoveOption } from "../../models/SSLTypes.js";

describe("PurgeCommandExecutor", () => {
    describe("execute", () => {
        let sandbox: SinonSandbox;

        let preferences: StubbedInstance<UserPreferences>;
        let analyticsService: StubbedInstance<AnalyticsService>;
        let logger: StubbedInstance<Logger>;

        let commandExecutor: CommandExecutor;

        beforeEach(() => {
            sandbox = sinon.createSandbox();

            preferences = stubInterface();
            analyticsService = stubInterface();
            logger = stubInterface();

            commandExecutor = new PurgeCommandExecutor(preferences, analyticsService, logger);
        });

        afterEach(() => {
            sandbox.restore();
        });

        const shouldPurgePrompt = {
            type: "select",
            name: "purgeConfirmation",
            message: promptMessage("Are you sure you want to remove all SSL artifacts from your system"),
            choices: [
                { title: promptMessageOption("No, keep existing SSL artifacts"), value: SSLRemoveOption.Keep },
                { title: promptMessageOption("Yes, remove all SSL artifacts"), value: SSLRemoveOption.Remove }
            ],
            initial: 0
        };

        it("should prompt on whether to remove SSL artifacts and log warning and exit when user does not select any option.", async () => {
            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.withArgs(shouldPurgePrompt).resolves({ purgeConfirmation: undefined });

            analyticsService.postEvent.resolves();

            await commandExecutor.execute();

            assert.equal(
                analyticsService.postEvent.calledOnceWith(
                    AnalyticsErrorMarkers.ERROR_SSL_PURGE,
                    "SSL purge option is not specified.",
                    false
                ),
                true
            );
        });

        it("should prompt on whether to remove SSL artifacts and exit when user chooses to keep the existing.", async () => {
            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.withArgs(shouldPurgePrompt).resolves({ purgeConfirmation: SSLRemoveOption.Keep });

            await commandExecutor.execute();

            assert.equal(analyticsService.postEvent.notCalled, true);
            assert.equal(logger.information.notCalled, true);
        });

        it("should prompt on whether to remove SSL artifacts and remove both custom and WXP SSL artifacts when user chooses to remove.", async () => {
            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.withArgs(shouldPurgePrompt).resolves({ purgeConfirmation: SSLRemoveOption.Remove });

            const preferenceJson = new PreferenceJson({
                ssl: [
                    [
                        "localhost",
                        {
                            certificatePath: path.join("custom", "localhost", "certificate.cert"),
                            keyPath: path.join("custom", "localhost", "private-key.key")
                        }
                    ],
                    [
                        "localhost.adobe.com",
                        {
                            certificatePath: path.join("custom", "localhost.adobe.com", "certificate.cert"),
                            keyPath: path.join("custom", "localhost.adobe.com", "private-key.key")
                        }
                    ]
                ]
            });
            preferences.get.returns(preferenceJson);

            const wxpSSLLocation = path.join("wxp", "devcert");
            sandbox.stub(devcert, "location").returns(wxpSSLLocation);

            const existsStub = sandbox.stub(fs, "existsSync");
            existsStub.withArgs(wxpSSLLocation).returns(true);

            const removeAllStub = sandbox.stub(devcert, "removeAll");
            removeAllStub.returns();

            await commandExecutor.execute();

            assert.equal(
                logger.information.calledOnceWith("Removing and invalidating all SSL artifacts from your system ...", {
                    prefix: "\n"
                }),
                true
            );
            assert.equal(
                logger.message.getCall(0).calledWith("This may require you to enter your system's password,"),
                true
            );
            assert.equal(
                logger.message
                    .getCall(1)
                    .calledWith(
                        "so that the SSL certificate can be removed from your system's trusted certificate path."
                    ),
                true
            );
            assert.equal(
                logger.message.getCall(2).calledWith("[If this takes longer than expected, please break and retry]"),
                true
            );

            preferenceJson.ssl = undefined;
            assert.equal(preferences.set.calledOnceWith(preferenceJson), true);
            assert.equal(
                analyticsService.postEvent
                    .getCall(0)
                    .calledWith(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_MANUAL_PURGE, "", true),
                true
            );

            assert.equal(removeAllStub.calledOnce, true);
            assert.equal(
                analyticsService.postEvent
                    .getCall(1)
                    .calledWith(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_AUTOMATIC_PURGE, "", true),
                true
            );

            assert.equal(
                logger.success.calledWith("Removed all SSL artifacts.", { prefix: "\n", postfix: "\n" }),
                true
            );
        });
    });
});

function promptMessage(message: string): string {
    return chalk.hex("#E59400")(message);
}

function promptMessageOption(message: string): string {
    return chalk.green.bold(message);
}
