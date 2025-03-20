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

import type { AnalyticsConsent, AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import { runCommand } from "@oclif/test";
import { assert } from "chai";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AddOnFactory } from "../../app/AddOnFactory.js";
import { IContainer, ITypes } from "../../config/index.js";
import { CLIOptions } from "../../models/CLIOptions.js";

describe("create-ccweb-add-on", () => {
    let sandbox: sinon.SinonSandbox;

    let container: sinon.SinonStub;

    let addOnFactory: StubbedInstance<AddOnFactory>;

    let analyticsConsent: StubbedInstance<AnalyticsConsent>;
    let analyticsService: StubbedInstance<AnalyticsService>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

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

    describe("create", () => {
        it("should execute succesfully when correct parameters are passed.", async () => {
            analyticsConsent.set.resolves();

            await runCommand(["hello-world", "--entrypoint=panel", "--template=react-javascript"], {
                root: "."
            });

            const options = new CLIOptions(EntrypointType.PANEL, "hello-world", "react-javascript", false);
            assert.equal(addOnFactory.create.calledOnceWith(options), true);
        });
    });
});
