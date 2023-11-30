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

import applicationConfigPath from "application-config-path";
import { assert } from "chai";
import fs from "fs-extra";
import "mocha";
import os from "os";
import path from "path";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import { ADD_ON_PREFERENCES_FILE, CCWEB_ADDON_DIRECTORY } from "../../constants.js";
import { PreferenceJson } from "../../models/PreferenceJson.js";
import type { Preferences } from "../../utilities/index.js";
import { CLIPreferences } from "../../utilities/index.js";

describe("CLIPreferences", () => {
    let sandbox: SinonSandbox;
    let cliPreferences: Preferences;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        cliPreferences = new CLIPreferences();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("get", () => {
        it(`should return empty preferences if '${ADD_ON_PREFERENCES_FILE}' does not exit.`, () => {
            const preferenceFilePath = `/some-directory/${CCWEB_ADDON_DIRECTORY}/${ADD_ON_PREFERENCES_FILE}`;

            sandbox
                .stub(path, "join")
                .withArgs(applicationConfigPath(CCWEB_ADDON_DIRECTORY), ADD_ON_PREFERENCES_FILE)
                .returns(preferenceFilePath);

            sandbox.stub(fs, "existsSync").withArgs(preferenceFilePath).returns(false);

            const ensureFileStub = sandbox.stub(fs, "ensureFileSync");
            ensureFileStub.withArgs(preferenceFilePath).returns();

            const writeFileStub = sandbox.stub(fs, "writeFileSync");
            writeFileStub.withArgs(preferenceFilePath, JSON.stringify({}, undefined, 4) + os.EOL).returns();

            const preferences = cliPreferences.get();

            assert.deepEqual(new PreferenceJson({}), preferences);
            assert.equal(ensureFileStub.calledOnceWith(preferenceFilePath), true);
            assert.equal(
                writeFileStub.calledOnceWith(preferenceFilePath, JSON.stringify({}, undefined, 4) + os.EOL),
                true
            );
        });

        it(`should return empty preferences if '${ADD_ON_PREFERENCES_FILE}' exists but has no data.`, () => {
            const preferenceFilePath = `/some-directory/${CCWEB_ADDON_DIRECTORY}/${ADD_ON_PREFERENCES_FILE}`;

            sandbox
                .stub(path, "join")
                .withArgs(applicationConfigPath(CCWEB_ADDON_DIRECTORY), ADD_ON_PREFERENCES_FILE)
                .returns(preferenceFilePath);

            sandbox.stub(fs, "existsSync").withArgs(preferenceFilePath).returns(true);

            sandbox.stub(fs, "readFileSync").withArgs(preferenceFilePath, "utf-8").returns("");

            const preferences = cliPreferences.get();
            assert.deepEqual(new PreferenceJson({}), preferences);
        });

        it(`should return empty preferences if any error is encountered while reading '${ADD_ON_PREFERENCES_FILE}'.`, () => {
            const preferenceFilePath = `/some-directory/${CCWEB_ADDON_DIRECTORY}/${ADD_ON_PREFERENCES_FILE}`;

            sandbox
                .stub(path, "join")
                .withArgs(applicationConfigPath(CCWEB_ADDON_DIRECTORY), ADD_ON_PREFERENCES_FILE)
                .returns(preferenceFilePath);

            sandbox.stub(fs, "existsSync").withArgs(preferenceFilePath).returns(true);

            sandbox
                .stub(fs, "readFileSync")
                .withArgs(preferenceFilePath, "utf-8")
                .throws(new Error("Unexpected error"));

            const preferences = cliPreferences.get();
            assert.deepEqual(new PreferenceJson({}), preferences);
        });

        it(`should return preferences with values if '${ADD_ON_PREFERENCES_FILE}' exits and has data.`, () => {
            const preferenceFilePath = `/some-directory/${CCWEB_ADDON_DIRECTORY}/${ADD_ON_PREFERENCES_FILE}`;
            const expectedPreference = {
                hasTelemetryConsent: false,
                clientId: 1096361282655,
                ssl: {
                    localhost: {
                        certificatePath: "/some-directory/localhost/ssl/certificate.cert",
                        keyPath: "/some-directory/localhost/ssl/private-key.key"
                    },
                    "localhost.adobe.com": {
                        certificatePath: "/some-directory/localhost.adobe.com/ssl/certificate.cert",
                        keyPath: "/some-directory/localhost.adobe.com/ssl/private-key.key"
                    }
                }
            };

            sandbox
                .stub(path, "join")
                .withArgs(applicationConfigPath(CCWEB_ADDON_DIRECTORY), ADD_ON_PREFERENCES_FILE)
                .returns(preferenceFilePath);

            const fileExistsStub = sandbox.stub(fs, "existsSync");
            fileExistsStub.withArgs(preferenceFilePath).returns(true);

            const readFileStub = sandbox.stub(fs, "readFileSync");
            readFileStub.withArgs(preferenceFilePath, "utf-8").returns(JSON.stringify(expectedPreference));

            const actualPreference = cliPreferences.get();

            assert.equal(actualPreference.hasTelemetryConsent, expectedPreference.hasTelemetryConsent);
            assert.equal(actualPreference.clientId, expectedPreference.clientId);
            assert.deepEqual(actualPreference.ssl, new Map(Object.entries(expectedPreference.ssl)));

            const cachedPreference = cliPreferences.get(true);

            assert.deepEqual(cachedPreference, actualPreference);
            assert.equal(fileExistsStub.callCount, 1);
            assert.equal(readFileStub.callCount, 1);
        });
    });

    describe("set", () => {
        it(`should write the provided preferences to '${ADD_ON_PREFERENCES_FILE}'.`, () => {
            const preferenceFilePath = `/some-directory/${CCWEB_ADDON_DIRECTORY}/${ADD_ON_PREFERENCES_FILE}`;
            const preference = {
                hasTelemetryConsent: false,
                clientId: 1096361282655,
                ssl: {
                    localhost: {
                        certificatePath: "/some-directory/localhost/ssl/certificate.cert",
                        keyPath: "/some-directory/localhost/ssl/private-key.key"
                    },
                    "localhost.adobe.com": {
                        certificatePath: "/some-directory/localhost.adobe.com/ssl/certificate.cert",
                        keyPath: "/some-directory/localhost.adobe.com/ssl/private-key.key"
                    }
                }
            };

            sandbox
                .stub(path, "join")
                .withArgs(applicationConfigPath(CCWEB_ADDON_DIRECTORY), ADD_ON_PREFERENCES_FILE)
                .returns(preferenceFilePath);

            sandbox.stub(fs, "existsSync").withArgs(preferenceFilePath).returns(true);

            sandbox.stub(fs, "readFileSync").withArgs(preferenceFilePath, "utf-8").returns(JSON.stringify(preference));

            const preferenceJson = cliPreferences.get();
            preferenceJson.clientId = 123456789;

            const writeFileStub = sandbox.stub(fs, "writeFileSync");
            writeFileStub.withArgs(preferenceFilePath, preferenceJson.toJSON() + os.EOL).returns();

            cliPreferences.set(preferenceJson);

            assert.equal(writeFileStub.calledOnceWith(preferenceFilePath, preferenceJson.toJSON() + os.EOL), true);
        });
    });
});
