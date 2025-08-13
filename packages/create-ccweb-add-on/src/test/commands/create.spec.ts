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
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { PROGRAM_NAME } from "@adobe/ccweb-add-on-scaffolder";
import { Config } from "@oclif/core";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers } from "../../AnalyticsMarkers.js";
import type { AddOnFactory } from "../../app/AddOnFactory.js";
import { Create } from "../../commands/create.js";
import { IContainer, ITypes } from "../../config/index.js";
import { CLIOptions } from "../../models/CLIOptions.js";

chai.use(chaiAsPromised);

describe("Create", () => {
    let sandbox: sinon.SinonSandbox;

    let container: sinon.SinonStub;

    let addOnFactory: StubbedInstance<AddOnFactory>;

    let analyticsConsent: StubbedInstance<AnalyticsConsent>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, "log");

        addOnFactory = stubInterface();
        addOnFactory.create.resolves();

        analyticsConsent = stubInterface();
        analyticsService = stubInterface();

        container = sandbox.stub(IContainer, "get");
        container.withArgs(ITypes.AddOnFactory).returns(addOnFactory);

        container.withArgs(IAnalyticsTypes.AnalyticsConsent).returns(analyticsConsent);
        container.withArgs(IAnalyticsTypes.AnalyticsService).returns(analyticsService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("run", () => {
        it("should execute succesfully when correct parameters are passed without analytics.", async () => {
            analyticsConsent.get.resolves(true);

            const create = new Create(
                ["hello-world", "--entrypoint=panel", "--template=react-javascript", "--verbose"],
                new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." })
            );
            sandbox
                // @ts-ignore - Sidestep `this.parse()` error when calling `run()` directly.
                .stub(create, "parse")
                .resolves({
                    args: { name: "hello-world" },
                    flags: {
                        entrypoint: EntrypointType.PANEL,
                        template: "react-javascript",
                        analytics: undefined,
                        verbose: true
                    }
                });

            await create.run();

            assert.equal(analyticsConsent.get.callCount, 1);

            const options = new CLIOptions(EntrypointType.PANEL, "hello-world", "react-javascript", true);
            assert.equal(addOnFactory.create.calledOnceWith(options), true);
        });

        it("should execute succesfully when correct parameters are passed with analytics.", async () => {
            analyticsConsent.get.resolves(true);
            analyticsConsent.set.withArgs(false).resolves();

            const create = new Create(
                ["hello-world", "--entrypoint=panel", "--template=react-javascript", "--analytics=off", "--verbose"],
                new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." })
            );
            sandbox
                // @ts-ignore - Sidestep `this.parse()` error when calling `run()` directly.
                .stub(create, "parse")
                .resolves({
                    args: { name: "hello-world" },
                    flags: {
                        entrypoint: EntrypointType.PANEL,
                        template: "react-javascript",
                        analytics: "off",
                        verbose: true
                    }
                });

            await create.run();

            assert.equal(analyticsConsent.set.calledOnceWith(false), true);

            const options = new CLIOptions(EntrypointType.PANEL, "hello-world", "react-javascript", true);
            assert.equal(addOnFactory.create.calledOnceWith(options), true);
        });
    });

    describe("catch", () => {
        it("should fail for any errors in command execution.", async () => {
            const create = new Create([], new Config({ name: PROGRAM_NAME, version: "1.0.0", root: "." }));

            const error = new Error("Something went wrong.");
            await expect(create.catch(error)).to.be.rejectedWith(error);

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
