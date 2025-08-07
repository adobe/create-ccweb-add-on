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
import { DEFAULT_OUTPUT_DIRECTORY } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import "mocha";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsSuccessMarkers } from "../../AnalyticsMarkers.js";
import { CleanCommandExecutor } from "../../app/CleanCommandExecutor.js";
import type { ScriptManager } from "../../app/ScriptManager.js";

describe("CleanCommandExecutor", () => {
    let sandbox: SinonSandbox;

    let scriptManager: StubbedInstance<ScriptManager>;
    let logger: StubbedInstance<Logger>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    let executor: CleanCommandExecutor;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        scriptManager = stubInterface<ScriptManager>();
        logger = stubInterface<Logger>();
        analyticsService = stubInterface<AnalyticsService>();
        analyticsService.postEvent.resolves();

        executor = new CleanCommandExecutor(scriptManager, logger, analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("execute ...", () => {
        it("should clean destination directory when 'clean' script is run.", async () => {
            scriptManager.cleanDirectory.withArgs(DEFAULT_OUTPUT_DIRECTORY).resolves();

            await executor.execute();

            assert.equal(logger.information.callCount, 1);
            assert.equal(
                logger.information.calledWith(`Cleaning output directory ${DEFAULT_OUTPUT_DIRECTORY}/ ...`),
                true
            );

            assert.equal(analyticsService.postEvent.callCount, 1);
            assert.equal(
                analyticsService.postEvent.calledWith(
                    AnalyticsSuccessMarkers.SCRIPTS_CLEAN_COMMAND_SUCCESS,
                    "Successfully cleaned output directory.",
                    true
                ),
                true
            );

            assert.equal(logger.success.callCount, 1);
            assert.equal(logger.success.calledWith("Done.", { postfix: "\n" }), true);
        });
    });
});
