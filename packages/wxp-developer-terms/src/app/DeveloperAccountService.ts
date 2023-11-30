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
import { CCWEB_ADDON_DIRECTORY, ITypes } from "@adobe/ccweb-add-on-core";
import applicationConfigPath from "application-config-path";
import axios from "axios";
import chalk from "chalk";
import { inject, injectable } from "inversify";
import path from "path";
import process from "process";
import prompts from "prompts";
import "reflect-metadata";
import format from "string-template";
import terminalLink from "terminal-link";
import { AIO_CONFIG_FILE, API_URL, PRIVILEGED_EMAILS } from "../constants.js";
import type { DtouAcceptanceData, UserOrgData } from "../models/Types.js";
import { AcceptTermsOfUse } from "../models/Types.js";
import { AuthLibManager } from "../utilities/AuthLibManager.js";
import type { AccountService } from "./AccountService.js";

/**
 * Implementation class for managing developer account related services.
 */
@injectable()
export class DeveloperAccountService implements AccountService {
    private readonly _logger: Logger;

    /**
     * Instantiate {@link DeveloperAccountService}.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link DeveloperAccountService} instance.
     */
    constructor(@inject(ITypes.Logger) logger: Logger) {
        this._logger = logger;
        process.env.AIO_CONFIG_FILE = path.join(applicationConfigPath(CCWEB_ADDON_DIRECTORY), AIO_CONFIG_FILE);
    }

    /**
     * Seek consent for terms of use.
     * @returns Promise.
     */
    async seekTermsOfUseConsent() {
        const authToken = await this._fetchAuthToken();
        const userDetails = await this._fetchUserDetails(authToken);
        if (this._isPrivileged(userDetails.email)) {
            return;
        }

        const { orgId } = await this._fetchUserOrgId(authToken);
        const hasAccepted = await this._hasAcceptedTermsOfUse(authToken, orgId);
        if (!hasAccepted) {
            await this._seekTermsOfUseAcceptance();
            await this._saveTermsOfUseAcceptance(authToken, orgId);
        }
    }

    /**
     * Invalidate user's token (if present).
     * @param verbose - Verbose flag.
     * @returns Promise.
     */
    async invalidateToken(verbose: boolean): Promise<void> {
        const { invalidateToken, context, CLI } = AuthLibManager.setupAuthLib();

        const accessToken = await context.get(`${CLI}.access_token`);
        if (!accessToken || !accessToken.data) {
            if (verbose) {
                this._logger.information(LOGS.alreadyLoggedOut);
            }
            return;
        }
        try {
            await invalidateToken(CLI, true);
            if (verbose) {
                this._logger.success(LOGS.successfullyLoggedOut);
            }
        } catch {
            this._logger.error(LOGS.failedToLogout, { prefix: LOGS.newLine, postfix: LOGS.newLine });
            process.exit(1);
        }
    }

    /**
     * Check if the user is privileged.
     * @returns Promise which resolves to a boolean value.
     */
    async isUserPrivileged(): Promise<boolean> {
        const authToken = await this._fetchAuthToken();
        const userDetails = await this._fetchUserDetails(authToken);

        return this._isPrivileged(userDetails.email);
    }

    private async _fetchAuthToken() {
        const { context, getToken, CLI } = AuthLibManager.setupAuthLib();

        try {
            context.setCli({
                "cli.bare-output": true
            });
            const loginOptions = {
                open: true,
                ["client_id"]: "wxp_cli"
            };

            return await getToken(CLI, loginOptions);
        } catch (error) {
            if (error.code === "TIMEOUT") {
                this._logger.error(LOGS.loginTimeout, { prefix: LOGS.newLine, postfix: LOGS.newLine });
            } else {
                this._logger.error(LOGS.fetchAuthTokenError, { prefix: LOGS.newLine, postfix: LOGS.newLine });
            }

            return process.exit(1);
        }
    }

    private async _fetchUserDetails(authToken: string) {
        const FETCH_USER_DETAILS_HEADER = {
            Authorization: `Bearer ${authToken}`,
            "x-api-key": "wxp_cli"
        };
        try {
            const { data: userDetails } = await axios.post(
                API_URL.FETCH_USER_DETAILS,
                {},
                {
                    headers: FETCH_USER_DETAILS_HEADER
                }
            );

            return userDetails;
        } catch {
            this._logger.error(LOGS.fetchingUserDetailsError, { prefix: LOGS.newLine, postfix: LOGS.newLine });
            return process.exit(1);
        }
    }

    private async _fetchUserOrgId(authToken: string): Promise<UserOrgData> {
        const FETCH_ORG_ID_HEADERS = {
            Accept: "application/vnd.adobe-ffcaddon.response+json",
            Authorization: `Bearer ${authToken}`,
            "x-api-key": "wxp_cli"
        };
        try {
            const { data: userOrgData = [] }: { data: UserOrgData[] } = await axios.get(API_URL.FETCH_ORG_ID, {
                headers: FETCH_ORG_ID_HEADERS
            });

            if (userOrgData.length === 0) {
                this._logger.error(LOGS.adminOrDeveloperRoleRequired);
                this._logger.error(LOGS.loginWithOtherUser);
                process.exit(1);
            }
            if (userOrgData.length === 1) {
                return userOrgData?.[0];
            }

            const choices = userOrgData.map(orgDetails => ({
                title: this._promptMessageOption(orgDetails.name),
                value: orgDetails
            }));

            const response = await prompts.prompt({
                type: "select",
                name: "selectedOrg",
                message: this._promptMessage(LOGS.selectOrg),
                choices,
                initial: 0
            });

            if (!response?.selectedOrg?.orgId) {
                return process.exit(1);
            }

            return response.selectedOrg;
        } catch {
            this._logger.error(LOGS.fetchUserOrgError, { prefix: LOGS.newLine, postfix: LOGS.newLine });
            return process.exit(1);
        }
    }

    private async _hasAcceptedTermsOfUse(authToken: string, orgId: string): Promise<boolean> {
        const DEVELOPER_TERMS_HEADER = {
            Accept: "application/vnd.adobe-ffcaddon.response+json",
            Authorization: `Bearer ${authToken}`,
            "x-api-key": "wxp_cli",
            "x-org-id": orgId
        };

        try {
            const { data: dtouConsent }: { data: DtouAcceptanceData } = await axios.get(
                API_URL.FETCH_DEVELOPER_TERMS_ACCEPTANCE,
                {
                    headers: DEVELOPER_TERMS_HEADER
                }
            );

            return dtouConsent.accepted && dtouConsent.current;
        } catch {
            this._logger.error(format(LOGS.fetchTermsOfUseError, { termsOfUseLabel: LOGS.termsOfUseLabel }), {
                prefix: LOGS.newLine,
                postfix: LOGS.newLine
            });

            return process.exit(1);
        }
    }

    private async _seekTermsOfUseAcceptance() {
        this._logger.warning(
            format(LOGS.termsOfUseAcceptanceText, {
                termsOfUseLabel: terminalLink(LOGS.termsOfUseLabel, LOGS.termsOfUseUrl)
            }),
            {
                prefix: LOGS.newLine
            }
        );

        const response = await prompts.prompt({
            type: "select",
            name: "termsOfUseConsent",
            message: this._promptMessage(LOGS.accept),
            choices: [
                { title: this._promptMessageOption(AcceptTermsOfUse.Yes.toString()), value: AcceptTermsOfUse.Yes },
                { title: this._promptMessageOption(AcceptTermsOfUse.No.toString()), value: AcceptTermsOfUse.No }
            ],
            initial: 0
        });

        if (!response || !response.termsOfUseConsent || response.termsOfUseConsent === AcceptTermsOfUse.No) {
            this._logger.error(format(LOGS.acceptanceIsMandatory, { termsOfUseLabel: LOGS.termsOfUseLabel }), {
                prefix: LOGS.newLine,
                postfix: LOGS.newLine
            });

            return process.exit(1);
        }
    }

    private async _saveTermsOfUseAcceptance(authToken: string, orgId: string): Promise<void> {
        const ACCEPT_DEVELOPER_TERMS_HEADER = {
            Accept: "application/vnd.adobe-ffcaddon.response+json",
            "Content-Type": "application/vnd.adobe-ffcaddon.request+json",
            Authorization: `Bearer ${authToken}`,
            "x-api-key": "wxp_cli",
            "x-org-id": orgId
        };

        try {
            await axios.post(
                API_URL.ACCEPT_DEVELOPER_TERMS,
                {},
                {
                    headers: ACCEPT_DEVELOPER_TERMS_HEADER
                }
            );
        } catch {
            this._logger.error(format(LOGS.provideTermsOfUseConsentError, { termsOfUseLabel: LOGS.termsOfUseLabel }), {
                prefix: LOGS.newLine,
                postfix: LOGS.newLine
            });
            return process.exit(1);
        }
    }

    private _isPrivileged(email: string) {
        const [, emailDomain] = email.split("@");
        return PRIVILEGED_EMAILS.includes(emailDomain?.toLowerCase() ?? "");
    }

    private _promptMessage(message: string): string {
        return chalk.hex("#E59400")(message);
    }

    private _promptMessageOption(message: string): string {
        return chalk.green.bold(message);
    }
}

const LOGS = {
    newLine: "\n",
    termsOfUseAcceptanceText: "To run this command, you must first read and accept the {termsOfUseLabel}",
    termsOfUseLabel: "Developer Terms of Use",
    termsOfUseUrl: "https://www.adobe.com/go/developer-terms",
    accept: "Accept",
    acceptanceIsMandatory: "Acceptance of the {termsOfUseLabel} is mandatory.",
    selectOrg: "Please select the organization where you would like to log in",
    adminOrDeveloperRoleRequired:
        "To build an add-on, you either need an admin or a developer role. Please contact your administrator to assign you either of these roles.",
    loginWithOtherUser:
        "Please try again with the --login option for logging in with your personal account, to build the add-on using your publisher identity.",
    alreadyLoggedOut: "You are already logged out.",
    successfullyLoggedOut: "You have been successfully logged out.",
    loginTimeout: "Login could not be completed within the permitted time. Please try again.",
    fetchAuthTokenError: "Login failed. Please try again.",
    fetchingUserDetailsError: "Failed to fetch your details. Please try again.",
    fetchUserOrgError: "Failed to fetch organization details. Please try again.",
    fetchTermsOfUseError: "Failed to get your consent for the {termsOfUseLabel}. Please try again.",
    provideTermsOfUseConsentError: "Failed to save your consent for the {termsOfUseLabel}. Please try again.",
    failedToLogout: "Failed to log you out. Please try again."
};
