/********************************************************************************
 * MIT License
 *
 * © Copyright 2025 Adobe. All rights reserved.
 *
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
 * IMPLIED, INCLUDING BUT NOT- LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ********************************************************************************/

import { DEFAULT_OUTPUT_DIRECTORY } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import fs from "fs-extra";
import "mocha";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import format from "string-template";
import { CONSOLE_OVERRIDE_SCRIPT, CONSOLE_OVERRIDE_SCRIPT_NAME } from "../../constants.js";
import { AddOnDirectory } from "../../models/AddOnDirectory.js";
import { GlobalOverrides } from "../../utilities/GlobalOverrides.js";
import { createManifest } from "../test-utilities.js";

describe("GlobalOverrides", () => {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("overrideGlobalConsole", () => {
        it("should write the console override script to the output directory.", () => {
            const writeFileSyncStub = sandbox.stub(fs, "writeFileSync");

            const addOnManifest = createManifest();
            const addOnDirectory = new AddOnDirectory("src", addOnManifest);

            GlobalOverrides.overrideGlobalConsole(addOnManifest, addOnDirectory);

            const overrideScriptPath = path.join(process.cwd(), DEFAULT_OUTPUT_DIRECTORY, CONSOLE_OVERRIDE_SCRIPT_NAME);
            const addOnName = JSON.stringify(addOnManifest.name?.toString());
            const scriptContent = format(CONSOLE_OVERRIDE_SCRIPT, {
                addOnName
            });

            assert.equal(writeFileSyncStub.calledWith(overrideScriptPath, scriptContent, "utf-8"), true);
        });

        it("should use the directory name for the add-on name when the manifest name is missing.", () => {
            const writeFileSyncStub = sandbox.stub(fs, "writeFileSync");

            const addOnManifest = createManifest();
            delete addOnManifest.manifestProperties.name;

            const addOnDirectory = new AddOnDirectory("src", addOnManifest);

            GlobalOverrides.overrideGlobalConsole(addOnManifest, addOnDirectory);

            const overrideScriptPath = path.join(process.cwd(), DEFAULT_OUTPUT_DIRECTORY, CONSOLE_OVERRIDE_SCRIPT_NAME);
            const addOnName = JSON.stringify(addOnDirectory.rootDirName);
            const scriptContent = format(CONSOLE_OVERRIDE_SCRIPT, {
                addOnName
            });

            assert.equal(writeFileSyncStub.calledWith(overrideScriptPath, scriptContent, "utf-8"), true);
        });
    });
});
