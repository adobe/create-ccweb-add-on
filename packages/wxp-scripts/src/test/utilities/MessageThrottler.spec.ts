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
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { EntityTracker } from "../../utilities/index.js";
import { FileChangeTracker } from "../../utilities/index.js";

describe("FileChangeTracker", () => {
    describe("registerAction and track ...", () => {
        let logger: StubbedInstance<Logger>;
        let entityTracker: EntityTracker;

        beforeEach(() => {
            logger = stubInterface<Logger>();
            logger.information.returns();

            entityTracker = new FileChangeTracker();
        });

        it("should do nothing when no action is registered and a message is received.", async () => {
            entityTracker.track("message1", "hello world!");

            await sleep(entityTracker.throttleTime);
            assert.equal(logger.information.callCount, 0);
        });

        it("should trigger registered action when a message is received.", async () => {
            entityTracker.registerAction(message => logger.information(`${message[0]} | Size: ${message[1].size}`));

            const id = "message1";
            const message = "hello world!";
            entityTracker.track(id, message);

            await sleep(entityTracker.throttleTime);
            assert.equal(logger.information.callCount, 1);
            assert.equal(logger.information.calledWith(`${id} | Size: 1`), true);
        });
    });
});

function sleep(timeInMs: number) {
    return new Promise(resolve => setTimeout(resolve, timeInMs));
}
