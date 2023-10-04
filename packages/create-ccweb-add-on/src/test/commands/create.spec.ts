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

import type { AnalyticsConsent, AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import type { AccountService } from "@adobe/ccweb-add-on-developer-terms";
import { ITypes as IDeveloperTermsTypes } from "@adobe/ccweb-add-on-developer-terms";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { Config } from "@oclif/core";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import type { AddOnFactory } from "../../app/index.js";
import { CreateCCWebAddOn } from "../../commands/create.js";
import { IContainer, ITypes } from "../../config/index.js";
import { CLIOptions } from "../../models/index.js";

chai.use(chaiAsPromised);

describe("CreateCCWebAddOn", () => {
    let sandbox: sinon.SinonSandbox;

    let container: sinon.SinonStub;

    let addOnFactory: StubbedInstance<AddOnFactory>;

    let accountService: StubbedInstance<AccountService>;

    let analyticsConsent: StubbedInstance<AnalyticsConsent>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        addOnFactory = stubInterface();
        addOnFactory.create.resolves();

        accountService = stubInterface();
        accountService.invalidateToken.resolves();
        accountService.seekTermsOfUseConsent.resolves();

        analyticsConsent = stubInterface();
        analyticsService = stubInterface();

        container = sandbox.stub(IContainer, "get");
        container.withArgs(ITypes.AddOnFactory).returns(addOnFactory);

        container.withArgs(IDeveloperTermsTypes.AccountService).returns(accountService);

        container.withArgs(IAnalyticsTypes.AnalyticsConsent).returns(analyticsConsent);
        container.withArgs(IAnalyticsTypes.AnalyticsService).returns(analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("run", () => {
        it("should execute succesfully when correct parameters are passed without analytics.", async () => {
            analyticsConsent.get.resolves(true);

            const createCCWebAddOn = new CreateCCWebAddOn(
                ["hello-world", "--kind=panel", "--template=react-javascript", "--login", "--verbose"],
                new Config({ root: "." })
            );

            await createCCWebAddOn.run();

            assert.equal(accountService.invalidateToken.callCount, 1);
            assert.equal(accountService.seekTermsOfUseConsent.callCount, 1);

            assert.equal(analyticsConsent.get.callCount, 1);

            const options = new CLIOptions(EntrypointType.PANEL, "hello-world", "react-javascript", true);
            assert.equal(addOnFactory.create.calledOnceWith(options), true);
        });

        it("should execute succesfully when correct parameters are passed with analytics.", async () => {
            analyticsConsent.get.resolves(true);
            analyticsConsent.set.withArgs(false).resolves();

            const createCCWebAddOn = new CreateCCWebAddOn(
                [
                    "hello-world",
                    "--kind=panel",
                    "--template=react-javascript",
                    "--login",
                    "--analytics=off",
                    "--verbose"
                ],
                new Config({ root: "." })
            );

            await createCCWebAddOn.run();

            assert.equal(accountService.invalidateToken.callCount, 1);
            assert.equal(accountService.seekTermsOfUseConsent.callCount, 1);

            assert.equal(analyticsConsent.set.calledOnceWith(false), true);

            const options = new CLIOptions(EntrypointType.PANEL, "hello-world", "react-javascript", true);
            assert.equal(addOnFactory.create.calledOnceWith(options), true);
        });
    });

    describe("catch", () => {
        it("should fail when incorrect parameters are passed.", async () => {
            const createCCWebAddOn = new CreateCCWebAddOn(["--incorrect-flag"], new Config({ root: "." }));

            const error = new Error("Nonexistent flag: --incorrect-flag\nSee more help with --help");

            await expect(createCCWebAddOn.catch(error)).to.be.rejectedWith();

            assert.equal(
                analyticsService.postEvent.calledOnceWith(
                    AnalyticsErrorMarkers.ERROR_INVALID_ARGS,
                    error.message,
                    false
                ),
                true
            );
        });
    });
});
