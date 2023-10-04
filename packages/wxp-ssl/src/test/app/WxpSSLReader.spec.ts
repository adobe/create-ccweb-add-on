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

import type { Preferences, Logger } from "@adobe/ccweb-add-on-core";
import { ADD_ON_PREFERENCES_FILE, PreferenceJson } from "@adobe/ccweb-add-on-core";
import { assert } from "chai";
import devcert from "@adobe/ccweb-add-on-devcert";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { SSLReader } from "../../app/index.js";
import { WxpSSLReader } from "../../app/index.js";

describe("WxpSSLReader", () => {
    let sandbox: sinon.SinonSandbox;

    let preferences: StubbedInstance<Preferences>;
    let logger: StubbedInstance<Logger>;
    let sslReader: SSLReader;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        preferences = stubInterface<Preferences>();
        logger = stubInterface<Logger>();
        sslReader = new WxpSSLReader(preferences, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("isCustomSSL", () => {
        it(`should return false if SSL settings are not present in '${ADD_ON_PREFERENCES_FILE}' for the provided hostname.`, async () => {
            const hostname = "localhost";
            const userPreference = new PreferenceJson({});

            preferences.get.returns(userPreference);

            const isCustomSSL = sslReader.isCustomSSL(hostname);

            assert.equal(isCustomSSL, false);
        });

        it(`should return true if SSL settings are present in '${ADD_ON_PREFERENCES_FILE}' for the provided hostname.`, async () => {
            const hostname = "localhost";
            const userPreference = new PreferenceJson({
                ssl: {
                    [hostname]: {
                        certificatePath: "/some-directory/localhost/ssl/certificate.cert",
                        keyPath: "/some-directory/localhost/ssl/private-key.key"
                    }
                }
            });

            preferences.get.returns(userPreference);

            const isCustomSSL = sslReader.isCustomSSL(hostname);

            assert.equal(isCustomSSL, true);
        });
    });

    describe("isWxpSSL", () => {
        it("should return false if devcert SSL certificate is not present for the provided hostname.", async () => {
            const hostname = "localhost";

            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(false);

            const isWxpSSL = sslReader.isWxpSSL(hostname);

            assert.equal(isWxpSSL, false);
        });

        it("should return false if devcert SSL certificate is not present for the provided hostname.", async () => {
            const hostname = "localhost";

            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(false);

            const isWxpSSL = sslReader.isWxpSSL(hostname);

            assert.equal(isWxpSSL, false);
        });
    });

    describe("read", async () => {
        it("should log error and exit when SSL certificate path is invalid for manually set up SSL.", async () => {
            const hostname = "localhost";

            const certificatePath = "/some-directory/localhost/ssl/";
            const keyPath = "/some-directory/localhost/ssl/private-key.key";
            const userPreference = new PreferenceJson({
                ssl: { [hostname]: { certificatePath, keyPath } }
            });
            preferences.get.returns(userPreference);

            const existsStub = sandbox.stub(fs, "existsSync");
            existsStub.withArgs(certificatePath).returns(true);
            existsStub.withArgs(keyPath).returns(true);

            const certificateStats = <Stats>{ isFile: () => false };
            const keyStats = <Stats>{ isFile: () => true };
            const lstatStub = sandbox.stub(fs, "lstatSync");
            lstatStub.withArgs(certificatePath).returns(certificateStats);
            lstatStub.withArgs(keyPath).returns(keyStats);

            logger.error.returns();
            const exitStub = sandbox.stub(process, "exit");

            await sslReader.read(hostname);

            assert.equal(logger.error.calledOnceWith("Invalid SSL certificate file path."), true);
            assert.equal(exitStub.calledWith(1), true);
        });

        it("should log error and exit when SSL key path is invalid for manually set up SSL.", async () => {
            const hostname = "localhost";

            const certificatePath = "/some-directory/localhost/ssl/certificate.cert";
            const keyPath = "/some-directory/localhost/ssl/";
            const userPreference = new PreferenceJson({
                ssl: { [hostname]: { certificatePath, keyPath } }
            });
            preferences.get.returns(userPreference);

            const existsStub = sandbox.stub(fs, "existsSync");
            existsStub.withArgs(certificatePath).returns(true);
            existsStub.withArgs(keyPath).returns(true);

            const certificateStats = <Stats>{ isFile: () => true };
            const keyStats = <Stats>{ isFile: () => false };
            const lstatStub = sandbox.stub(fs, "lstatSync");
            lstatStub.withArgs(certificatePath).returns(certificateStats);
            lstatStub.withArgs(keyPath).returns(keyStats);

            logger.error.returns();
            const exitStub = sandbox.stub(process, "exit");

            await sslReader.read(hostname);

            assert.equal(logger.error.calledOnceWith("Invalid SSL key file path."), true);
            assert.equal(exitStub.calledWith(1), true);
        });

        it("should read and return SSL certificate and key data for manually set up SSL.", async () => {
            const hostname = "localhost";

            const certificatePath = "/some-directory/localhost/ssl/certificate.cert";
            const keyPath = "/some-directory/localhost/ssl/private-key.key";
            const userPreference = new PreferenceJson({
                ssl: { [hostname]: { certificatePath, keyPath } }
            });
            preferences.get.returns(userPreference);

            const existsStub = sandbox.stub(fs, "existsSync");
            existsStub.withArgs(certificatePath).returns(true);
            existsStub.withArgs(keyPath).returns(true);

            const stats = <Stats>{ isFile: () => true };
            const lstatStub = sandbox.stub(fs, "lstatSync");
            lstatStub.withArgs(certificatePath).returns(stats);
            lstatStub.withArgs(keyPath).returns(stats);

            const certificateData = <Buffer>{};
            const keyData = <Buffer>{};
            const readFileStub = sandbox.stub(fs, "readFileSync");
            readFileStub.withArgs(certificatePath).returns(certificateData);
            readFileStub.withArgs(keyPath).returns(keyData);

            const sslData = await sslReader.read(hostname);

            assert.equal(sslData.cert, certificateData);
            assert.equal(sslData.key, keyData);
        });

        it("should read and return SSL certificate and key data for automatically set up SSL.", async () => {
            const hostname = "localhost";

            const userPreference = new PreferenceJson({});
            preferences.get.returns(userPreference);

            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(true);

            const certificateData = <Buffer>{};
            const keyData = <Buffer>{};

            const certificateForStub = sandbox.stub(devcert, "certificateFor");
            // @ts-ignore -- IReturnData mock response
            certificateForStub.withArgs(hostname).returns({ cert: certificateData, key: keyData });

            const sslData = await sslReader.read(hostname);

            assert.equal(sslData.cert, certificateData);
            assert.equal(sslData.key, keyData);
        });

        it("should log error and exit when SSL is not set up.", async () => {
            const hostname = "localhost";

            const userPreference = new PreferenceJson({});
            preferences.get.returns(userPreference);

            sandbox.stub(devcert, "hasCertificateFor").returns(false);

            logger.error.returns();
            const exitStub = sandbox.stub(process, "exit");

            await sslReader.read(hostname);

            assert.equal(
                logger.error.calledOnceWith(
                    "No SSL related certificate or key files were found. Please retry after setting them up.",
                    { postfix: "\n" }
                ),
                true
            );
            assert.equal(exitStub.calledWith(1), true);
        });
    });
});
