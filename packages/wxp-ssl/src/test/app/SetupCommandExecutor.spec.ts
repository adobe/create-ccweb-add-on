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
import type { Logger, Preferences } from "@adobe/ccweb-add-on-core";
import { ADD_ON_PREFERENCES_FILE, PreferenceJson } from "@adobe/ccweb-add-on-core";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import chalk from "chalk";
import devcert from "@adobe/ccweb-add-on-devcert";
import type { Stats } from "fs-extra";
import fs from "fs-extra";
import "mocha";
import path from "path";
import process from "process";
import prompts from "prompts";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import format from "string-template";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import { AnalyticsErrorMarkers, AnalyticsSuccessMarkers } from "../../AnalyticsMarkers.js";
import type { CommandExecutor, SSLReader } from "../../app/index.js";
import { SetupCommandExecutor } from "../../app/index.js";
import { SSLRemoveOption, SSLSetupOption, SetupCommandOptions } from "../../models/index.js";

chai.use(chaiAsPromised);

describe("SSLSetupCommandExecutor", () => {
    let sandbox: SinonSandbox;

    let preferences: StubbedInstance<Preferences>;
    let sslReader: StubbedInstance<SSLReader>;
    let analyticsService: StubbedInstance<AnalyticsService>;
    let logger: StubbedInstance<Logger>;

    let commandExecutor: CommandExecutor;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        sandbox.stub(console, "log");

        preferences = stubInterface();
        sslReader = stubInterface();
        analyticsService = stubInterface();
        logger = stubInterface();

        commandExecutor = new SetupCommandExecutor(preferences, sslReader, analyticsService, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("execute", () => {
        const sslSetupTypePrompt = {
            type: "select",
            name: "sslSetupType",
            message: promptMessage("How do you want to set up your SSL certificate"),
            choices: [
                {
                    title: promptMessageOption("Automatically, set it up for me"),
                    value: SSLSetupOption.Automatically
                },
                {
                    title: promptMessageOption("Manually, I already have an SSL certificate and key"),
                    value: SSLSetupOption.Manually
                }
            ],
            initial: 0
        };

        const sslCertificatePathPrompt = {
            type: "text",
            name: "sslPath",
            message: promptMessage("Please enter the path of your SSL certificate file")
        };

        const sslKeyPathPrompt = {
            type: "text",
            name: "sslPath",
            message: promptMessage("Please enter the path of your SSL key file")
        };

        describe("when 'useExisting' flag is set to 'true'", () => {
            it("should not prompt when SSL is set up manually for the provided hostname.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(true);

                const promptStub = sandbox.stub(prompts, "prompt");

                const options = new SetupCommandOptions(hostname, true, false);
                await commandExecutor.execute(options);

                assert.equal(promptStub.callCount, 0);
            });

            it("should not prompt when SSL is set up automatically for the provided hostname.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(false);
                sslReader.isWxpSSL.withArgs(hostname).returns(true);

                const promptStub = sandbox.stub(prompts, "prompt");

                const options = new SetupCommandOptions(hostname, true, false);
                await commandExecutor.execute(options);

                assert.equal(promptStub.callCount, 0);
            });

            it("should log warning and exit when user does not select any option in the SSL setup prompt.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(false);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(sslSetupTypePrompt).resolves({ sslSetupType: undefined });

                analyticsService.postEvent.resolves();

                logger.warning.returns();

                const processExitStub = sandbox.stub(process, "exit");

                const options = new SetupCommandOptions(hostname, true, false);
                await commandExecutor.execute(options);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format("The Add-on requires a trusted SSL certificate in order to run on https://{hostname}", {
                            hostname: options.hostname
                        }),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(promptStub.calledOnceWith(sslSetupTypePrompt), true);

                assert.equal(
                    analyticsService.postEvent.calledOnceWith(
                        AnalyticsErrorMarkers.ERROR_SSL_SETUP,
                        "SSL setup option is not specified.",
                        false
                    ),
                    true
                );

                assert.equal(processExitStub.callCount, 1);
            });

            it("should log warning and exit when user provides an incorrect SSL certificate path.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(false);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const certificatePath = "/some-directory/localhost/ssl/";
                const keyPath = "/some-directory/localhost/ssl/private-key.key";

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(sslSetupTypePrompt).resolves({
                    sslSetupType: SSLSetupOption.Manually
                });

                promptStub.withArgs(sslCertificatePathPrompt).resolves({ sslPath: certificatePath });
                promptStub.withArgs(sslKeyPathPrompt).resolves({ sslPath: keyPath });

                analyticsService.postEvent.resolves();

                logger.warning.returns();
                logger.error.returns();

                const processExitStub = sandbox.stub(process, "exit");

                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(certificatePath).returns(true);
                existsStub.withArgs(keyPath).returns(true);

                const certificateStats = <Stats>{ isFile: () => false };
                const keyStats = <Stats>{ isFile: () => true };

                const lstatStub = sandbox.stub(fs, "lstatSync");
                lstatStub.withArgs(certificatePath).returns(certificateStats);
                lstatStub.withArgs(keyPath).returns(keyStats);

                const exitError = new Error("Process exit.");
                processExitStub.callsFake(() => {
                    throw exitError;
                });

                const options = new SetupCommandOptions(hostname, true, false);

                const execute = () => commandExecutor.execute(options);
                await expect(execute()).to.be.rejectedWith(exitError);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format("The Add-on requires a trusted SSL certificate in order to run on https://{hostname}", {
                            hostname: options.hostname
                        }),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(logger.error.callCount, 3);
                assert.equal(
                    logger.error.calledWith(format("Invalid {asset} path specified.", { asset: "certificate" })),
                    true
                );

                assert.equal(
                    analyticsService.postEvent.calledOnceWith(
                        AnalyticsErrorMarkers.ERROR_SSL_SETUP,
                        format("Invalid {asset} path specified.", { asset: "certificate" }),
                        false
                    ),
                    true
                );
            });

            it("should log warning and exit when user provides an incorrect SSL key path.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(false);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const certificatePath = "/some-directory/localhost/ssl/certificate.cert";
                const keyPath = "/some-directory/localhost/ssl/";

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub
                    .withArgs({
                        type: "select",
                        name: "sslSetupType",
                        message: promptMessage("How do you want to set up your SSL certificate"),
                        choices: [
                            {
                                title: promptMessageOption("Automatically, set it up for me"),
                                value: SSLSetupOption.Automatically
                            },
                            {
                                title: promptMessageOption("Manually, I already have an SSL certificate and key"),
                                value: SSLSetupOption.Manually
                            }
                        ],
                        initial: 0
                    })
                    .resolves({
                        sslSetupType: SSLSetupOption.Manually
                    });

                promptStub.withArgs(sslCertificatePathPrompt).resolves({ sslPath: certificatePath });
                promptStub.withArgs(sslKeyPathPrompt).resolves({ sslPath: keyPath });

                analyticsService.postEvent.resolves();

                logger.warning.returns();
                logger.error.returns();

                const processExitStub = sandbox.stub(process, "exit");

                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(certificatePath).returns(true);
                existsStub.withArgs(keyPath).returns(true);

                const certificateStats = <Stats>{ isFile: () => true };
                const keyStats = <Stats>{ isFile: () => false };

                const lstatStub = sandbox.stub(fs, "lstatSync");
                lstatStub.withArgs(certificatePath).returns(certificateStats);
                lstatStub.withArgs(keyPath).returns(keyStats);

                const exitError = new Error("Process exit.");
                processExitStub.callsFake(() => {
                    throw exitError;
                });

                const options = new SetupCommandOptions(hostname, true, false);

                const execute = () => commandExecutor.execute(options);
                await expect(execute()).to.be.rejectedWith(exitError);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format("The Add-on requires a trusted SSL certificate in order to run on https://{hostname}", {
                            hostname: options.hostname
                        }),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(logger.error.callCount, 3);
                assert.equal(
                    logger.error.calledWith(format("Invalid {asset} path specified.", { asset: "key" })),
                    true
                );

                assert.equal(
                    analyticsService.postEvent.calledOnceWith(
                        AnalyticsErrorMarkers.ERROR_SSL_SETUP,
                        format("Invalid {asset} path specified.", { asset: "key" }),
                        false
                    ),
                    true
                );
            });

            it(`should set the 'ssl' property in '${ADD_ON_PREFERENCES_FILE}' for successful manual SSL setup.`, async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(false);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const certificatePath = "/some-directory/localhost/ssl/certificate.cert";
                const keyPath = "/some-directory/localhost/ssl/private-key.key";

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(sslSetupTypePrompt).resolves({
                    sslSetupType: SSLSetupOption.Manually
                });

                promptStub.withArgs(sslCertificatePathPrompt).resolves({ sslPath: certificatePath });
                promptStub.withArgs(sslKeyPathPrompt).resolves({ sslPath: keyPath });

                preferences.get.returns(new PreferenceJson({}));
                preferences.set.returns();

                analyticsService.postEvent.resolves();

                logger.warning.returns();
                logger.success.returns();

                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(certificatePath).returns(true);
                existsStub.withArgs(keyPath).returns(true);

                const certificateStats = <Stats>{ isFile: () => true };
                const keyStats = <Stats>{ isFile: () => true };

                const lstatStub = sandbox.stub(fs, "lstatSync");
                lstatStub.withArgs(certificatePath).returns(certificateStats);
                lstatStub.withArgs(keyPath).returns(keyStats);

                const options = new SetupCommandOptions(hostname, true, false);
                await commandExecutor.execute(options);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format("The Add-on requires a trusted SSL certificate in order to run on https://{hostname}", {
                            hostname: options.hostname
                        }),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(
                    logger.success.calledOnceWith("Your preferences have been saved.", { prefix: "\n", postfix: "\n" }),
                    true
                );

                assert.equal(
                    analyticsService.postEvent.calledOnceWith(
                        AnalyticsSuccessMarkers.SUCCESSFUL_SSL_MANUAL_SETUP,
                        options.hostname,
                        true
                    ),
                    true
                );
            });

            it("should create a devcert SSL certificate for automatic SSL setup.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(false);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(sslSetupTypePrompt).resolves({
                    sslSetupType: SSLSetupOption.Automatically
                });

                const caPath = "/some-directory/certificate-authority/certificate.cert";
                const sslDirectory = `/some-directory/domains/${hostname}`;

                sandbox
                    .stub(devcert, "certificateFor")
                    .withArgs(hostname, { getCaPath: true })
                    // @ts-ignore -- IReturnData mock response
                    .resolves({ cert: <Buffer>{}, key: <Buffer>{}, caPath });

                sandbox.stub(path, "resolve").withArgs(caPath, "..", "..", "domains", hostname).returns(sslDirectory);

                analyticsService.postEvent.resolves();

                logger.warning.returns();
                logger.success.returns();
                logger.message.returns();

                const options = new SetupCommandOptions(hostname, true, false);
                await commandExecutor.execute(options);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format("The Add-on requires a trusted SSL certificate in order to run on https://{hostname}", {
                            hostname: options.hostname
                        }),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(
                    logger.message
                        .getCall(0)
                        .calledWith("This is only a one time step and may require you to enter your system's password"),
                    true
                );
                assert.equal(
                    logger.message
                        .getCall(1)
                        .calledWith(
                            "so that the SSL certificate can be added to your system's trusted certificate path."
                        ),
                    true
                );
                assert.equal(
                    logger.message
                        .getCall(2)
                        .calledWith("[If this takes longer than expected, please break and retry]"),
                    true
                );

                assert.equal(logger.success.calledOnceWith("SSL setup complete!", { prefix: "\n" }), true);

                assert.equal(
                    logger.information
                        .getCall(0)
                        .calledWith("Setting up self-signed SSL certificate ...", { prefix: "\n" }),
                    true
                );
                assert.equal(
                    logger.information
                        .getCall(1)
                        .calledWith(format("You can find the SSL certificate in {sslDirectory}.", { sslDirectory }), {
                            postfix: "\n"
                        }),
                    true
                );

                assert.equal(
                    analyticsService.postEvent.calledOnceWith(
                        AnalyticsSuccessMarkers.SUCCESSFUL_SSL_AUTOMATIC_SETUP,
                        options.hostname,
                        true
                    ),
                    true
                );
            });
        });

        describe("when 'useExisting' flag is set to 'false'", () => {
            const shouldRemovePrompt = {
                type: "select",
                name: "shouldRemove",
                message: promptMessage("Do you want to remove your existing SSL certificate to set up a new one"),
                choices: [
                    {
                        title: promptMessageOption("Yes, remove the existing SSL certificate"),
                        value: SSLRemoveOption.Remove
                    },
                    { title: promptMessageOption("No, keep my existing SSL certificate"), value: SSLRemoveOption.Keep }
                ],
                initial: 0
            };

            it("should prompt on whether to remove existing SSL and log warning and exit when user does not select any option.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(true);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(shouldRemovePrompt).resolves({ shouldRemove: undefined });

                analyticsService.postEvent.resolves();

                logger.warning.returns();

                const processExitStub = sandbox.stub(process, "exit");

                const exitError = new Error("Process exit.");
                processExitStub.callsFake(() => {
                    throw exitError;
                });

                const options = new SetupCommandOptions(hostname, false, false);

                const execute = () => commandExecutor.execute(options);
                await expect(execute()).to.be.rejectedWith(exitError);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format(
                            "A trusted SSL certificate is already configured for the Add-on to run on https://{hostname}",
                            { hostname: options.hostname }
                        ),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(
                    analyticsService.postEvent.calledOnceWith(
                        AnalyticsErrorMarkers.ERROR_SSL_REMOVE,
                        "SSL remove option is not specified.",
                        false
                    ),
                    true
                );
            });

            it("should prompt on whether to remove existing SSL and exit when user chooses to keep the existing.", async () => {
                const hostname = "localhost";
                sslReader.isCustomSSL.withArgs(hostname).returns(true);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(shouldRemovePrompt).resolves({ shouldRemove: SSLRemoveOption.Keep });

                analyticsService.postEvent.resolves();

                logger.warning.returns();

                const options = new SetupCommandOptions(hostname, false, false);
                await commandExecutor.execute(options);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format(
                            "A trusted SSL certificate is already configured for the Add-on to run on https://{hostname}",
                            { hostname: options.hostname }
                        ),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(promptStub.withArgs(sslSetupTypePrompt).callCount, 0);
            });

            it("should remove existing and create a new one when user chooses to remove a manually set up SSL.", async () => {
                const hostname = "localhost";
                const certificatePath = "/some-directory/localhost/ssl/certificate.cert";
                const keyPath = "/some-directory/localhost/ssl/private-key.key";

                // SSL remove.
                sslReader.isCustomSSL.withArgs(hostname).returns(true);
                sslReader.isWxpSSL.withArgs(hostname).returns(false);

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(shouldRemovePrompt).resolves({ shouldRemove: SSLRemoveOption.Remove });

                analyticsService.postEvent.resolves();

                logger.warning.returns();

                preferences.get.onCall(0).returns(
                    new PreferenceJson({
                        ssl: {
                            [hostname]: { certificatePath, keyPath }
                        }
                    })
                );

                // SSL setup.
                promptStub.withArgs(sslSetupTypePrompt).resolves({
                    sslSetupType: SSLSetupOption.Manually
                });

                promptStub.withArgs(sslCertificatePathPrompt).resolves({ sslPath: certificatePath });
                promptStub.withArgs(sslKeyPathPrompt).resolves({ sslPath: keyPath });

                preferences.get.onCall(1).returns(new PreferenceJson({}));
                preferences.set.returns();

                analyticsService.postEvent.resolves();

                logger.warning.returns();
                logger.success.returns();

                const existsStub = sandbox.stub(fs, "existsSync");
                existsStub.withArgs(certificatePath).returns(true);
                existsStub.withArgs(keyPath).returns(true);

                const certificateStats = <Stats>{ isFile: () => true };
                const keyStats = <Stats>{ isFile: () => true };

                const lstatStub = sandbox.stub(fs, "lstatSync");
                lstatStub.withArgs(certificatePath).returns(certificateStats);
                lstatStub.withArgs(keyPath).returns(keyStats);

                const options = new SetupCommandOptions(hostname, false, false);
                await commandExecutor.execute(options);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format(
                            "A trusted SSL certificate is already configured for the Add-on to run on https://{hostname}",
                            { hostname: options.hostname }
                        ),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(
                    analyticsService.postEvent
                        .getCall(0)
                        .calledWith(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_MANUAL_REMOVE, options.hostname, true),
                    true
                );

                assert.equal(logger.success.getCall(0).calledWith("Removed.", { postfix: "\n" }), true);

                assert.equal(
                    logger.success
                        .getCall(1)
                        .calledWith("Your preferences have been saved.", { prefix: "\n", postfix: "\n" }),
                    true
                );

                assert.equal(
                    analyticsService.postEvent
                        .getCall(1)
                        .calledWith(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_MANUAL_SETUP, options.hostname, true),
                    true
                );
            });

            it("should remove existing and create a new one when user chooses to remove an automatically set up SSL.", async () => {
                const hostname = "localhost";

                // SSL remove.
                sslReader.isCustomSSL.withArgs(hostname).returns(false);
                sslReader.isWxpSSL.withArgs(hostname).returns(true);

                const promptStub = sandbox.stub(prompts, "prompt");
                promptStub.withArgs(shouldRemovePrompt).resolves({ shouldRemove: SSLRemoveOption.Remove });

                analyticsService.postEvent.resolves();

                logger.warning.returns();

                // SSL setup.
                promptStub.withArgs(sslSetupTypePrompt).resolves({
                    sslSetupType: SSLSetupOption.Automatically
                });

                preferences.get.onCall(1).returns(new PreferenceJson({}));
                preferences.set.returns();

                const caPath = "/some-directory/certificate-authority/certificate.cert";
                const sslDirectory = `/some-directory/domains/${hostname}`;

                sandbox
                    .stub(devcert, "certificateFor")
                    .withArgs(hostname, { getCaPath: true })
                    // @ts-ignore -- IReturnData mock response
                    .resolves({ cert: <Buffer>{}, key: <Buffer>{}, caPath });

                const removeDomainStub = sandbox.stub(devcert, "removeDomain");
                removeDomainStub.withArgs(hostname).resolves();

                sandbox.stub(path, "resolve").withArgs(caPath, "..", "..", "domains", hostname).returns(sslDirectory);

                analyticsService.postEvent.resolves();

                logger.warning.returns();
                logger.success.returns();
                logger.message.returns();

                const options = new SetupCommandOptions(hostname, false, false);
                await commandExecutor.execute(options);

                assert.equal(removeDomainStub.calledWith(hostname), true);

                assert.equal(
                    logger.warning.calledOnceWith(
                        format(
                            "A trusted SSL certificate is already configured for the Add-on to run on https://{hostname}",
                            { hostname: options.hostname }
                        ),
                        {
                            prefix: "\n"
                        }
                    ),
                    true
                );

                assert.equal(
                    analyticsService.postEvent
                        .getCall(0)
                        .calledWith(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_AUTOMATIC_REMOVE, options.hostname, true),
                    true
                );

                assert.equal(logger.success.getCall(0).calledWith("Removed.", { postfix: "\n" }), true);
                assert.equal(logger.success.getCall(1).calledWith("SSL setup complete!", { prefix: "\n" }), true);

                assert.equal(
                    logger.message
                        .getCall(0)
                        .calledWith("This is only a one time step and may require you to enter your system's password"),
                    true
                );
                assert.equal(
                    logger.message
                        .getCall(1)
                        .calledWith(
                            "so that the SSL certificate can be added to your system's trusted certificate path."
                        ),
                    true
                );
                assert.equal(
                    logger.message
                        .getCall(2)
                        .calledWith("[If this takes longer than expected, please break and retry]"),
                    true
                );

                assert.equal(
                    logger.information
                        .getCall(0)
                        .calledWith("Setting up self-signed SSL certificate ...", { prefix: "\n" }),
                    true
                );
                assert.equal(
                    logger.information
                        .getCall(1)
                        .calledWith(format("You can find the SSL certificate in {sslDirectory}.", { sslDirectory }), {
                            postfix: "\n"
                        }),
                    true
                );

                assert.equal(
                    analyticsService.postEvent
                        .getCall(1)
                        .calledWith(AnalyticsSuccessMarkers.SUCCESSFUL_SSL_AUTOMATIC_SETUP, options.hostname, true),
                    true
                );
            });
        });
    });
});

function promptMessage(message: string): string {
    return chalk.hex("#E59400")(message);
}

function promptMessageOption(message: string): string {
    return chalk.green.bold(message);
}
