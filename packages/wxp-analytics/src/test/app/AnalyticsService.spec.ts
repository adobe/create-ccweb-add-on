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

import type { UserPreferences } from "@adobe/ccweb-add-on-core";
import { PreferenceJson } from "@adobe/ccweb-add-on-core";
import axios from "axios";
import { assert } from "chai";
import "mocha";
import osName from "os-name";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsService } from "../../app/AnalyticsService.js";
import { ANALYTICS_API } from "../../constants.js";
import { CLIProgram } from "../../models/CLIProgram.js";

describe("AnalyticsService", () => {
    let sandbox: SinonSandbox;

    let preferences: StubbedInstance<UserPreferences>;
    let analyticsService: AnalyticsService;

    const program = new CLIProgram("test-program", "1.0.0");

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        preferences = stubInterface<UserPreferences>();
        analyticsService = new AnalyticsService(preferences);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("postEvent", () => {
        it("should post event when user has provided consent to collect and send analytics to Adobe.", async () => {
            const currentTime = Date.now();
            sandbox.stub(Date, "now").returns(currentTime);

            const clientId = 10001;
            const preferenceJSON = new PreferenceJson({ clientId, hasTelemetryConsent: true });

            preferences.get.returns(preferenceJSON);

            sandbox.stub(Math, "random").returns(0.3);

            const axiosPostStub = sandbox.stub(axios, "post");
            axiosPostStub.resolves();

            const eventType = "SUCCESS";
            const eventData = "foobar";

            const expectedApiRequestBody = JSON.stringify({
                id: Math.floor(currentTime * Math.random()),
                timestamp: currentTime,
                _adobeio: {
                    eventType,
                    eventData,
                    cliVersion: program.version,
                    clientId,
                    command: program.name,
                    commandDuration: 0,
                    commandSuccess: true,
                    nodeVersion: process.version,
                    osNameVersion: osName()
                }
            });

            analyticsService.program = program;
            analyticsService.startTime = Date.now();

            await analyticsService.postEvent(eventType, eventData, true);

            assert.equal(preferences.set.callCount, 0);
            assert.equal(
                axiosPostStub.calledOnceWith(ANALYTICS_API.URL, expectedApiRequestBody, {
                    headers: ANALYTICS_API.HEADERS
                }),
                true
            );
        });

        const runs = [{ hasTelemetryConsent: undefined }, { hasTelemetryConsent: false }];
        runs.forEach(({ hasTelemetryConsent }) => {
            it("should not post event when user has not provided consent to collect and send analytics to Adobe.", async () => {
                const currentTime = Date.now();
                sandbox.stub(Date, "now").returns(currentTime);

                const clientId = 10001;
                const preferenceJSON = new PreferenceJson({ clientId, hasTelemetryConsent });

                preferences.get.returns(preferenceJSON);

                sandbox.stub(Math, "random").returns(0.3);

                const axiosPostStub = sandbox.stub(axios, "post");

                const eventType = "SUCCESS";
                const eventData = "foobar";

                analyticsService.program = program;
                analyticsService.startTime = currentTime;

                await analyticsService.postEvent(eventType, eventData, true);

                assert.equal(axiosPostStub.callCount, 0);
            });
        });

        it("should set a new clientId for the user if it does not exist and silently return for any errors.", async () => {
            const currentTime = Date.now();
            sandbox.stub(Date, "now").returns(currentTime);

            const preferenceJSON = new PreferenceJson({ hasTelemetryConsent: true });

            preferences.get.returns(preferenceJSON);
            preferences.set.returns();

            sandbox.stub(Math, "random").returns(0.3);

            const axiosPostStub = sandbox.stub(axios, "post");
            axiosPostStub.rejects();

            const eventType = "SUCCESS";
            const eventData = "foobar";

            analyticsService.program = program;
            analyticsService.startTime = currentTime;

            await analyticsService.postEvent(eventType, eventData, true);

            preferenceJSON.clientId = Math.floor(Date.now() * Math.random());

            assert.equal(preferences.set.calledOnceWith(preferenceJSON), true);
            assert.equal(axiosPostStub.callCount, 1);
        });
    });
});
