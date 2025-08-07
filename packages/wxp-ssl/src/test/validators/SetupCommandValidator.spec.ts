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
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import { SetupCommandOptions } from "../../models/SetupCommandOptions.js";
import type { CommandValidator } from "../../validators/CommandValidator.js";
import { SetupCommandValidator } from "../../validators/SetupCommandValidator.js";

chai.use(chaiAsPromised);

describe("SetupCommandValidator", () => {
    let sandbox: sinon.SinonSandbox;

    let processExitStub: SinonStub;

    let analyticsService: StubbedInstance<AnalyticsService>;
    let logger: StubbedInstance<Logger>;

    let commandValidator: CommandValidator<SetupCommandOptions>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        processExitStub = sandbox.stub(process, "exit");
        processExitStub.throws();

        analyticsService = stubInterface();
        logger = stubInterface();

        commandValidator = new SetupCommandValidator(analyticsService, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("validate", () => {
        let hostnames = ["", "foobar", "localhost.com"];
        hostnames.forEach(hostname => {
            it(`should log error and exit when a user provides an invalid hostname: '${hostname}'.`, async () => {
                const options = new SetupCommandOptions(hostname, true, true);

                await expect(commandValidator.validate(options)).to.be.rejected;

                assert.equal(processExitStub.calledOnce, true);
                assert.equal(
                    logger.error.calledOnceWith("Invalid hostname. Only 'localhost' and '*.adobe.com' are allowed.", {
                        prefix: "\n",
                        postfix: "\n"
                    }),
                    true
                );

                const eventData = ["--hostname", options.hostname, "--useExisting", options.useExisting];
                assert.equal(
                    analyticsService.postEvent.calledOnceWith(
                        AnalyticsErrorMarkers.ERROR_SSL_INVALID_HOSTNAME,
                        eventData.join(" "),
                        false
                    ),
                    true
                );
            });
        });

        hostnames = ["localhost", "localhost.adobe.com", "random.adobe.com"];
        hostnames.forEach(hostname => {
            it(`should return when a user provides a valid hostname: '${hostname}'.`, async () => {
                const options = new SetupCommandOptions(hostname, true, true);
                await commandValidator.validate(options);

                assert.equal(processExitStub.callCount, 0);
                assert.equal(logger.error.callCount, 0);
            });
        });
    });
});
