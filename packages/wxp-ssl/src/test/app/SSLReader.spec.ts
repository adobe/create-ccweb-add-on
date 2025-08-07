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

import type { Logger, Preferences } from "@adobe/ccweb-add-on-core";
import { ADD_ON_PREFERENCES_FILE, PreferenceJson } from "@adobe/ccweb-add-on-core";
import devcert from "@adobe/ccweb-add-on-devcert";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import sinon from "sinon";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { SSLReader } from "../../app/SSLReader.js";

chai.use(chaiAsPromised);

describe("SSLReader", () => {
    let sandbox: sinon.SinonSandbox;

    let preferences: StubbedInstance<Preferences>;
    let logger: StubbedInstance<Logger>;
    let sslReader: SSLReader;

    const hostname = "localhost.adobe.com";
    const port = 5241;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        preferences = stubInterface();
        logger = stubInterface();
        sslReader = new SSLReader(preferences, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("isCustomSSL", () => {
        it(`should return false if SSL settings are not present in '${ADD_ON_PREFERENCES_FILE}' for the provided hostname.`, async () => {
            const userPreference = new PreferenceJson({});

            preferences.get.returns(userPreference);

            const isCustomSSL = sslReader.isCustomSSL(hostname);

            assert.equal(isCustomSSL, false);
        });

        it(`should return true if SSL settings are present in '${ADD_ON_PREFERENCES_FILE}' for the provided hostname.`, async () => {
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
            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(false);

            const isWxpSSL = sslReader.isWxpSSL(hostname);

            assert.equal(isWxpSSL, false);
        });

        it("should return false if devcert SSL certificate is not present for the provided hostname.", async () => {
            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(false);

            const isWxpSSL = sslReader.isWxpSSL(hostname);

            assert.equal(isWxpSSL, false);
        });
    });

    describe("read", async () => {
        it("should log error and exit when SSL certificate path is invalid for manually set up SSL.", async () => {
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

            const exitStub = sandbox.stub(process, "exit");

            await sslReader.read(hostname, port);

            assert.equal(logger.error.calledOnceWith("Invalid SSL certificate file path."), true);
            assert.equal(exitStub.calledWith(1), true);
        });

        it("should log error and exit when SSL key path is invalid for manually set up SSL.", async () => {
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

            const exitStub = sandbox.stub(process, "exit");

            await sslReader.read(hostname, port);

            assert.equal(logger.error.calledOnceWith("Invalid SSL key file path."), true);
            assert.equal(exitStub.calledWith(1), true);
        });

        it("should read and return SSL data for manually set up SSL.", async () => {
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

            const sslData = await sslReader.read(hostname, port);

            assert.equal(sslData.cert, certificateData);
            assert.equal(sslData.key, keyData);

            assert.equal(
                logger.warning.getCall(0).calledWith("Could not determine the expiry of your SSL certificate."),
                true
            );
            assert.equal(
                logger.warning
                    .getCall(1)
                    .calledWith("If you are unable to sideload your add-on, please check the validity of:"),
                true
            );
            assert.equal(
                logger.warning.getCall(2).calledWith(`https://${hostname}:${port} certificate in your browser.`),
                true
            );
        });

        it("should read and return SSL data for automatically set up, valid SSL.", async () => {
            const userPreference = new PreferenceJson({});
            preferences.get.returns(userPreference);

            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(true);
            sandbox.stub(devcert, "caExpiryInDays").returns(50);
            sandbox.stub(devcert, "certificateExpiryInDays").returns(100);

            const certificateData = <Buffer>{};
            const keyData = <Buffer>{};

            const certificateForStub = sandbox.stub(devcert, "certificateFor");
            // @ts-ignore -- IReturnData mock response
            certificateForStub.withArgs(hostname).returns({ cert: certificateData, key: keyData });

            const sslData = await sslReader.read(hostname, port);

            assert.equal(sslData.cert, certificateData);
            assert.equal(sslData.key, keyData);
        });

        it("should log error and exit when automatically set up SSL has expired.", async () => {
            const userPreference = new PreferenceJson({});
            preferences.get.returns(userPreference);

            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(true);
            sandbox.stub(devcert, "caExpiryInDays").returns(0);
            sandbox.stub(devcert, "certificateExpiryInDays").returns(100);

            const exitStub = sandbox.stub(process, "exit");
            exitStub.throws();

            await expect(sslReader.read(hostname, port)).to.be.rejectedWith();

            assert.equal(
                logger.error.getCall(0).calledWith("Could not locate a valid SSL certificate to host the add-on."),
                true
            );
            assert.equal(logger.error.getCall(1).calledWith("The SSL certificate has expired."), true);
            assert.equal(
                logger.warning
                    .getCall(0)
                    .calledWith("To re-create the SSL certificate, you may run:", { prefix: "\n" }),
                true
            );
            assert.equal(
                logger.information
                    .getCall(0)
                    .calledWith("npx @adobe/ccweb-add-on-ssl setup --hostname [hostname]", { prefix: "  " }),
                true
            );
            assert.equal(logger.warning.getCall(1).calledWith("Example:", { prefix: "\n" }), true);
            assert.equal(
                logger.information.getCall(1).calledWith("npx @adobe/ccweb-add-on-ssl setup --hostname localhost", {
                    prefix: "  ",
                    postfix: "\n"
                }),
                true
            );

            assert.equal(exitStub.calledWith(1), true);
        });

        it("should read and return SSL data for automatically set up, valid SSL nearing expiry.", async () => {
            const userPreference = new PreferenceJson({});
            preferences.get.returns(userPreference);

            sandbox.stub(devcert, "hasCertificateFor").withArgs(hostname).returns(true);
            sandbox.stub(devcert, "caExpiryInDays").returns(5);
            sandbox.stub(devcert, "certificateExpiryInDays").returns(100);

            const certificateData = <Buffer>{};
            const keyData = <Buffer>{};

            const certificateForStub = sandbox.stub(devcert, "certificateFor");
            // @ts-ignore -- IReturnData mock response
            certificateForStub.withArgs(hostname).returns({ cert: certificateData, key: keyData });

            const sslData = await sslReader.read(hostname, port);

            assert.equal(logger.warning.calledWith("Your SSL certificate will expire in 5 days."), true);

            assert.equal(sslData.cert, certificateData);
            assert.equal(sslData.key, keyData);
        });

        it("should log error and exit when SSL is not set up.", async () => {
            const userPreference = new PreferenceJson({});
            preferences.get.returns(userPreference);

            sandbox.stub(devcert, "hasCertificateFor").returns(false);

            const exitStub = sandbox.stub(process, "exit");

            await sslReader.read(hostname, port);

            assert.equal(
                logger.error.getCall(0).calledWith("Could not locate a valid SSL certificate to host the add-on."),
                true
            );
            assert.equal(
                logger.error
                    .getCall(1)
                    .calledWith(
                        "If you had previously set it up, it may have been invalidated due to a version upgrade."
                    ),
                true
            );
            assert.equal(exitStub.calledWith(1), true);
        });
    });
});
