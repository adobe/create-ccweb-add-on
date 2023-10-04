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
import axios from "axios";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import chalk from "chalk";
import "mocha";
import prompts from "prompts";
import type { SinonSandbox } from "sinon";
import sinon from "sinon";
import format from "string-template";
import terminalLink from "terminal-link";
import type { StubbedInstance } from "ts-sinon";
import { stubInterface } from "ts-sinon";
import type { AccountService } from "../../app/index.js";
import { DeveloperAccountService } from "../../app/index.js";
import { API_URL } from "../../constants.js";
import { AcceptTermsOfUse } from "../../models/Types.js";
import { AuthLibManager } from "../../utilities/AuthLibManager.js";

chai.use(chaiAsPromised);

const AUTH_TOKEN = "auth-token";
const ORG_ID = "org-id";
const FETCH_USER_DETAILS_HEADER = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "x-api-key": "wxp_cli"
};
const FETCH_ORG_ID_HEADERS = {
    Accept: "application/vnd.adobe-ffcaddon.response+json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "x-api-key": "wxp_cli"
};
const DEVELOPER_TERMS_HEADER = {
    Accept: "application/vnd.adobe-ffcaddon.response+json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "x-api-key": "wxp_cli",
    "x-org-id": ORG_ID
};
const ACCEPT_DEVELOPER_TERMS_HEADER = {
    Accept: "application/vnd.adobe-ffcaddon.response+json",
    "Content-Type": "application/vnd.adobe-ffcaddon.request+json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "x-api-key": "wxp_cli",
    "x-org-id": ORG_ID
};

describe("DeveloperAccountService", () => {
    let sandbox: SinonSandbox;
    let logger: StubbedInstance<Logger>;
    let accountService: AccountService;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        logger = stubInterface<Logger>();
        accountService = new DeveloperAccountService(logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("seekTermsOfUseConsent", () => {
        it("should ask non '@adobe.com' developers to accept the Developer Terms of Use if they have not already accepted.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli: () => {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .returns(
                    Promise.resolve({
                        data: [
                            {
                                orgId: ORG_ID,
                                role: "ADMIN"
                            }
                        ]
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                })
                .returns(
                    Promise.resolve({
                        data: { current: false, accepted: false }
                    })
                );

            postCallStub
                .withArgs(
                    API_URL.ACCEPT_DEVELOPER_TERMS,
                    {},
                    {
                        headers: ACCEPT_DEVELOPER_TERMS_HEADER
                    }
                )
                .returns(Promise.resolve());

            const acceptTermsOfUsePrompt = {
                type: "select",
                name: "termsOfUseConsent",
                message: promptMessage("Accept"),
                choices: [
                    { title: promptMessageOption(AcceptTermsOfUse.Yes.toString()), value: AcceptTermsOfUse.Yes },
                    { title: promptMessageOption(AcceptTermsOfUse.No.toString()), value: AcceptTermsOfUse.No }
                ],
                initial: 0
            };

            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.withArgs(acceptTermsOfUsePrompt).resolves({ termsOfUseConsent: AcceptTermsOfUse.Yes });

            await accountService.seekTermsOfUseConsent();
            assert.equal(getCallStub.callCount, 2);
            assert.equal(postCallStub.callCount, 2);

            assert.equal(
                postCallStub.getCall(0).calledWith(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                ),
                true
            );

            assert.equal(
                getCallStub.getCall(0).calledWith(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                }),
                true
            );
            assert.equal(
                getCallStub.getCall(1).calledWith(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                }),
                true
            );
            assert.equal(
                postCallStub.getCall(1).calledWith(
                    API_URL.ACCEPT_DEVELOPER_TERMS,
                    {},
                    {
                        headers: ACCEPT_DEVELOPER_TERMS_HEADER
                    }
                ),
                true
            );

            assert.equal(promptStub.getCall(0).calledWith(acceptTermsOfUsePrompt), true);

            assert.equal(logger.warning.callCount, 1);

            assert.equal(
                logger.warning.calledOnceWith(
                    format("To run this command, you must first read and accept the {termsOfUseLabel}", {
                        termsOfUseLabel: terminalLink(
                            "Developer Terms of Use",
                            "https://www.adobe.com/go/developer-terms"
                        )
                    }),
                    {
                        prefix: "\n"
                    }
                ),
                true
            );
        });

        it("should not ask non '@adobe.com' developers to accept the Developer Terms of Use if they have already accepted.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli: () => {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .returns(
                    Promise.resolve({
                        data: [
                            {
                                orgId: ORG_ID,
                                role: "ADMIN"
                            }
                        ]
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                })
                .returns(
                    Promise.resolve({
                        data: { current: true, accepted: true }
                    })
                );

            const promptStub = sandbox.stub(prompts, "prompt");

            await accountService.seekTermsOfUseConsent();

            assert.equal(
                postCallStub.getCall(0).calledWith(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                ),
                true
            );

            assert.equal(
                getCallStub.getCall(0).calledWith(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                }),
                true
            );

            assert.equal(
                getCallStub.getCall(1).calledWith(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                }),
                true
            );

            assert.equal(promptStub.callCount, 0);
        });

        it("should log error and exit if a TIMEOUT error is returned while fetching the auth token.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => {
                    return Promise.reject({ code: "TIMEOUT" }); // eslint-disable-line prefer-promise-reject-errors -- We need to validate the error code
                }
            });

            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).rejects();

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                logger.error
                    .getCall(0)
                    .calledWith("Login could not be completed within the permitted time. Please try again."),
                true
            );
        });

        it("should log error and exit if an error is thrown while fetching the auth token.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.reject(Error())
            });

            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).rejects();

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(logger.error.getCall(0).calledWith("Login failed. Please try again."), true);
        });

        it("should log error and exit if the API call to FETCH_USER_DETAILS returns an error.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).rejects();

            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(Promise.reject(Error()));

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(logger.error.getCall(0).calledWith("Failed to fetch your details. Please try again."), true);
        });

        it("should log error and exit if the API call to FETCH_ORG_ID returns an error.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });
            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).throws();

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .rejects({
                    message: ""
                });

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                logger.error.getCall(0).calledWith("Failed to fetch organization details. Please try again."),
                true
            );
        });

        it("should log error and exit if the API call to FETCH_DEVELOPER_TERMS_ACCEPTANCE returns an error.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });
            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).throws();

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .returns(
                    Promise.resolve({
                        data: [
                            {
                                orgId: ORG_ID,
                                role: "ADMIN"
                            }
                        ]
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                })
                .returns(Promise.reject(Error()));

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                logger.error.getCall(0).calledWith(
                    format("Failed to get your consent for the {termsOfUseLabel}. Please try again.", {
                        termsOfUseLabel: "Developer Terms of Use"
                    }),
                    {
                        prefix: "\n",
                        postfix: "\n"
                    }
                ),
                true
            );
        });

        it("should log error and exit if the API call to ACCEPT_DEVELOPER_TERMS returns an error.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });
            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).throws();

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .returns(
                    Promise.resolve({
                        data: [
                            {
                                orgId: ORG_ID,
                                role: "ADMIN"
                            }
                        ]
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                })
                .returns(
                    Promise.resolve({
                        data: { current: false, accepted: false }
                    })
                );

            postCallStub
                .withArgs(
                    API_URL.ACCEPT_DEVELOPER_TERMS,
                    {},
                    {
                        headers: ACCEPT_DEVELOPER_TERMS_HEADER
                    }
                )
                .returns(Promise.reject(Error()));

            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.resolves({ termsOfUseConsent: "Y" });

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                logger.error.getCall(0).calledWith(
                    format("Failed to save your consent for the {termsOfUseLabel}. Please try again.", {
                        termsOfUseLabel: "Developer Terms of Use"
                    }),
                    {
                        prefix: "\n",
                        postfix: "\n"
                    }
                ),
                true
            );
        });

        it("should log error and exit if the API call to FETCH_ORG_ID returns no org.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });
            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).throws();

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .resolves({
                    data: []
                });

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                logger.error
                    .getCall(0)
                    .calledWith(
                        "To build an add-on, you either need an admin or a developer role. Please contact your administrator to assign you either of these roles."
                    ),
                true
            );
            assert.equal(
                logger.error
                    .getCall(1)
                    .calledWith(
                        "Please try again with the --login option for logging in with your personal account, to build the add-on using your publisher identity."
                    ),
                true
            );
        });

        it("should prompt the user to select an org if there are multiple orgs and exit if user does not provide an input.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).throws();

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");
            const userOrgData = [
                { name: "org1", orgId: ORG_ID },
                { name: "org2", orgId: "org2" }
            ];
            const choices = userOrgData.map(orgDetails => ({
                title: promptMessageOption(orgDetails.name),
                value: orgDetails
            }));

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .resolves({
                    data: userOrgData
                });

            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.resolves({ termsOfUseConsent: "Y", selectedOrg: { orgId: undefined } });

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;

            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                promptStub.getCall(0).calledWith({
                    type: "select",
                    name: "selectedOrg",
                    message: promptMessage("Please select the organization where you would like to log in"),
                    choices,
                    initial: 0
                }),
                true
            );
        });

        it("should prompt the user to select an org if there are multiple orgs and return the selected org.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const exitStub = sandbox.stub(process, "exit");

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .resolves({
                    data: [
                        { name: "org1", orgId: ORG_ID },
                        { name: "org2", orgId: "org2" }
                    ]
                });

            getCallStub
                .withArgs(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                })
                .returns(
                    Promise.resolve({
                        data: { current: false, accepted: false }
                    })
                );

            postCallStub
                .withArgs(
                    API_URL.ACCEPT_DEVELOPER_TERMS,
                    {},
                    {
                        headers: ACCEPT_DEVELOPER_TERMS_HEADER
                    }
                )
                .returns(Promise.resolve());

            const userOrgData = [
                { name: "org1", orgId: ORG_ID },
                { name: "org2", orgId: "org2" }
            ];
            const choices = userOrgData.map(orgDetails => ({
                title: promptMessageOption(orgDetails.name),
                value: orgDetails
            }));

            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.resolves({ termsOfUseConsent: "Y", selectedOrg: userOrgData[0] });

            await accountService.seekTermsOfUseConsent();

            assert.equal(
                promptStub.getCall(0).calledWith({
                    type: "select",
                    name: "selectedOrg",
                    message: promptMessage("Please select the organization where you would like to log in"),
                    choices,
                    initial: 0
                }),
                true
            );

            assert.equal(exitStub.callCount, 0);
        });

        it("should exit if user does not provide an input when asked for consent.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli: () => {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .returns(
                    Promise.resolve({
                        data: [
                            {
                                orgId: ORG_ID,
                                role: "ADMIN"
                            }
                        ]
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                })
                .returns(
                    Promise.resolve({
                        data: { current: false, accepted: false }
                    })
                );

            const acceptTermsOfUsePrompt = {
                type: "select",
                name: "termsOfUseConsent",
                message: promptMessage("Accept"),
                choices: [
                    { title: promptMessageOption(AcceptTermsOfUse.Yes.toString()), value: AcceptTermsOfUse.Yes },
                    { title: promptMessageOption(AcceptTermsOfUse.No.toString()), value: AcceptTermsOfUse.No }
                ],
                initial: 0
            };

            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.withArgs(acceptTermsOfUsePrompt).resolves({ termsOfUseConsent: undefined });

            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).throws();

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;
            assert.equal(getCallStub.callCount, 2);
            assert.equal(postCallStub.callCount, 1);

            assert.equal(
                postCallStub.getCall(0).calledWith(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                ),
                true
            );

            assert.equal(
                getCallStub.getCall(0).calledWith(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                }),
                true
            );

            assert.equal(
                getCallStub.getCall(1).calledWith(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                }),
                true
            );

            assert.equal(promptStub.getCall(0).calledWith(acceptTermsOfUsePrompt), true);
            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                logger.warning.calledOnceWith(
                    format("To run this command, you must first read and accept the {termsOfUseLabel}", {
                        termsOfUseLabel: terminalLink(
                            "Developer Terms of Use",
                            "https://www.adobe.com/go/developer-terms"
                        )
                    }),
                    {
                        prefix: "\n"
                    }
                ),
                true
            );
        });

        it("should exit if user does not accept developer terms of use.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli: () => {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const getCallStub = sandbox.stub(axios, "get");
            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: { email: "test@example.com" }
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                })
                .returns(
                    Promise.resolve({
                        data: [
                            {
                                orgId: ORG_ID,
                                role: "ADMIN"
                            }
                        ]
                    })
                );

            getCallStub
                .withArgs(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                })
                .returns(
                    Promise.resolve({
                        data: { current: false, accepted: false }
                    })
                );

            const acceptTermsOfUsePrompt = {
                type: "select",
                name: "termsOfUseConsent",
                message: promptMessage("Accept"),
                choices: [
                    { title: promptMessageOption(AcceptTermsOfUse.Yes.toString()), value: AcceptTermsOfUse.Yes },
                    { title: promptMessageOption(AcceptTermsOfUse.No.toString()), value: AcceptTermsOfUse.No }
                ],
                initial: 0
            };

            const promptStub = sandbox.stub(prompts, "prompt");
            promptStub.withArgs(acceptTermsOfUsePrompt).resolves({ termsOfUseConsent: AcceptTermsOfUse.No });

            const exitStub = sandbox.stub(process, "exit");
            exitStub.withArgs(1).throws();

            const seekTermsOfUseConsent = () => accountService.seekTermsOfUseConsent();
            await expect(seekTermsOfUseConsent()).to.be.rejected;
            assert.equal(getCallStub.callCount, 2);
            assert.equal(postCallStub.callCount, 1);

            assert.equal(
                postCallStub.getCall(0).calledWith(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                ),
                true
            );

            assert.equal(
                getCallStub.getCall(0).calledWith(API_URL.FETCH_ORG_ID, {
                    headers: FETCH_ORG_ID_HEADERS
                }),
                true
            );

            assert.equal(
                getCallStub.getCall(1).calledWith(API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE, {
                    headers: DEVELOPER_TERMS_HEADER
                }),
                true
            );

            assert.equal(promptStub.getCall(0).calledWith(acceptTermsOfUsePrompt), true);
            assert.equal(exitStub.calledWith(1), true);
            assert.equal(
                logger.warning.calledOnceWith(
                    format("To run this command, you must first read and accept the {termsOfUseLabel}", {
                        termsOfUseLabel: terminalLink(
                            "Developer Terms of Use",
                            "https://www.adobe.com/go/developer-terms"
                        )
                    }),
                    {
                        prefix: "\n"
                    }
                ),
                true
            );
        });

        it("should not ask '@adobe.com' developers to accept the Developer Terms of Use.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli() {
                        return;
                    },
                    get: () => Promise.resolve(AUTH_TOKEN)
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            const postCallStub = sandbox.stub(axios, "post");

            postCallStub
                .withArgs(
                    API_URL.FETCH_USER_DETAILS,
                    {},
                    {
                        headers: FETCH_USER_DETAILS_HEADER
                    }
                )
                .returns(
                    Promise.resolve({
                        data: {
                            email: "test@adobe.com"
                        }
                    })
                );

            await accountService.seekTermsOfUseConsent();
        });
    });

    describe("invalidateToken", () => {
        it("should invalidate an existing auth token.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli: () => {
                        return;
                    },
                    get: () => Promise.resolve({ data: AUTH_TOKEN })
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            await accountService.invalidateToken(true);

            assert.equal(logger.error.callCount, 0);
            assert.equal(logger.success.getCall(0).calledWith("You have been successfully logged out."), true);
        });

        it("should log information and return if there is no existing auth token.", async () => {
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli: () => {
                        return;
                    },
                    get: () => Promise.resolve({ data: undefined })
                },
                invalidateToken: () => {
                    return;
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            await accountService.invalidateToken(true);

            assert.equal(logger.error.callCount, 0);
            assert.equal(logger.information.getCall(0).calledWith("You are already logged out."), true);
        });

        it("should log error and exit if any error is thrown.", async () => {
            const exitStub = sandbox.stub(process, "exit");
            sandbox.stub(AuthLibManager, "setupAuthLib").returns({
                CLI: "cli",
                context: {
                    setCli: () => {
                        return;
                    },
                    get: () => Promise.resolve({ data: AUTH_TOKEN })
                },
                invalidateToken: () => {
                    return Promise.reject(Error());
                },
                getToken: () => Promise.resolve(AUTH_TOKEN)
            });

            await accountService.invalidateToken(true);

            assert.equal(logger.error.callCount, 1);
            assert.equal(logger.error.getCall(0).calledWith("Failed to log you out. Please try again."), true);
            assert.equal(exitStub.calledWith(1), true);
        });
    });

    describe("isUserPrivileged", () => {
        const privilegedEmails = ["example@adobe.com", "random@ADOBETEST.com"];
        privilegedEmails.forEach(email => {
            it("should return 'true' for PRIVILEGED_EMAILS.", async () => {
                const authLib = {
                    CLI: "cli",
                    context: {
                        setCli: () => {
                            return;
                        },
                        get: () => Promise.resolve(AUTH_TOKEN)
                    },
                    invalidateToken: () => {
                        return;
                    },
                    getToken: () => Promise.resolve(AUTH_TOKEN)
                };

                sandbox.stub(AuthLibManager, "setupAuthLib").returns(authLib);

                sandbox
                    .stub(axios, "post")
                    .withArgs(
                        API_URL.FETCH_USER_DETAILS,
                        {},
                        {
                            headers: FETCH_USER_DETAILS_HEADER
                        }
                    )
                    .returns(
                        Promise.resolve({
                            data: { email }
                        })
                    );

                const isUserPrivileged = await accountService.isUserPrivileged();

                assert.equal(isUserPrivileged, true);
            });
        });

        const nonPrivilegedEmails = ["foo@bar.com", "adobe@notadobe.com", "adobe@notadobetest.com", "", "adobe.com"];
        nonPrivilegedEmails.forEach(email => {
            it("should return 'false' for non PRIVILEGED_EMAILS.", async () => {
                const authLib = {
                    CLI: "cli",
                    context: {
                        setCli: () => {
                            return;
                        },
                        get: () => Promise.resolve(AUTH_TOKEN)
                    },
                    invalidateToken: () => {
                        return;
                    },
                    getToken: () => Promise.resolve(AUTH_TOKEN)
                };

                sandbox.stub(AuthLibManager, "setupAuthLib").returns(authLib);

                sandbox
                    .stub(axios, "post")
                    .withArgs(
                        API_URL.FETCH_USER_DETAILS,
                        {},
                        {
                            headers: FETCH_USER_DETAILS_HEADER
                        }
                    )
                    .returns(
                        Promise.resolve({
                            data: { email }
                        })
                    );

                const isUserPrivileged = await accountService.isUserPrivileged();

                assert.equal(isUserPrivileged, false);
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
