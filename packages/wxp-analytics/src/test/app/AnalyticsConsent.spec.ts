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

import type { Logger, Preferences } from "@adobe/ccweb-add-on-core";
import { ADD_ON_PREFERENCES_FILE, PreferenceJson } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import chalk from "chalk";
import "mocha";
import prompts from "prompts";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsConsent } from "../../app/AnalyticsConsent.js";

describe("AnalyticsConsent", () => {
    let sandbox: SinonSandbox;

    let preferences: StubbedInstance<Preferences>;
    let logger: StubbedInstance<Logger>;
    let analyticsConsent: AnalyticsConsent;

    const choices: { title: string; value: boolean }[] = [];
    choices.push({
        title: promptMessageOption("Yes, send analytics to Adobe"),
        value: true
    });
    choices.push({
        title: promptMessageOption("No, don't send analytics to Adobe"),
        value: false
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        preferences = stubInterface<Preferences>();

        logger = stubInterface<Logger>();
        logger.warning.returns();

        analyticsConsent = new AnalyticsConsent(preferences, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("get", () => {
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it(`should ask the user for analytics consent if it does not exist in ${ADD_ON_PREFERENCES_FILE}.`, async () => {
            const promptsStub = sandbox.stub(prompts, "prompt");
            promptsStub.resolves({ analyticsConsent: choices[0].value });

            const preferenceJson = new PreferenceJson({});
            preferences.get.returns(preferenceJson);

            const userConsent = await analyticsConsent.get();

            assert.equal(
                logger.warning.calledWith(
                    "This tool collects and sends analytics to help Adobe improve its products.",
                    {
                        prefix: "\n"
                    }
                ),
                true
            );

            assert.equal(promptsStub.callCount, 1);
            assert.equal(
                promptsStub.calledWith({
                    type: "select",
                    name: "analyticsConsent",
                    message: promptMessage("Do you want to allow sending analytics to Adobe"),
                    choices,
                    initial: 0
                }),
                true
            );
            assert.equal(userConsent, true);
        });

        it(`should return the user's analytics consent if it exists in ${ADD_ON_PREFERENCES_FILE}.`, async () => {
            const promptsStub = sandbox.stub(prompts, "prompt");
            promptsStub.resolves({ analyticsConsent: choices[0].value });

            const preferenceJson = new PreferenceJson({ hasTelemetryConsent: true });
            preferences.get.returns(preferenceJson);

            const userConsent = await analyticsConsent.get();

            assert.equal(userConsent, true);
            assert.equal(promptsStub.callCount, 0);
        });

        it("should exit if the user does not select any option when asked for analytics consent.", async () => {
            const promptsStub = sandbox.stub(prompts, "prompt");
            const exitProcessStub = sandbox.stub(process, "exit");
            promptsStub.resolves({ analyticsConsent: undefined });

            const preferenceJson = new PreferenceJson({});
            preferences.get.returns(preferenceJson);

            const userConsent = await analyticsConsent.get();

            assert.equal(
                logger.warning.calledWith(
                    "This tool collects and sends analytics to help Adobe improve its products.",
                    {
                        prefix: "\n"
                    }
                ),
                true
            );

            assert.equal(promptsStub.callCount, 1);
            assert.equal(
                promptsStub.calledWith({
                    type: "select",
                    name: "analyticsConsent",
                    message: promptMessage("Do you want to allow sending analytics to Adobe"),
                    choices,
                    initial: 0
                }),
                true
            );
            assert.equal(userConsent, undefined);
            assert.equal(exitProcessStub.calledWith(0), true);
        });
    });

    describe("set", () => {
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it(`should set the user's analytics consent in ${ADD_ON_PREFERENCES_FILE}.`, async () => {
            const preferenceJson = new PreferenceJson({ hasTelemetryConsent: false });
            preferences.get.returns(preferenceJson);

            const analyticsConsent: AnalyticsConsent = new AnalyticsConsent(preferences, logger);

            await analyticsConsent.set(true);

            assert.equal(preferences.set.callCount, 1);
            assert.equal(preferences.set.calledWith(new PreferenceJson({ hasTelemetryConsent: true })), true);
        });
    });
});

function promptMessage(message: string): string {
    return chalk.hex("#E59400")(message);
}

function promptMessageOption(message: string): string {
    return chalk.green.bold(message);
}
