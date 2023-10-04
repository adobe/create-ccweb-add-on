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

import type { Logger, Preferences, SSLSettings } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes, isFile } from "@adobe/ccweb-add-on-core";
import devcert from "@adobe/ccweb-add-on-devcert";
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import type { SSLData } from "../models/index.js";

/**
 * Implementation class for reading the SSL artifacts.
 */
@injectable()
export class WxpSSLReader {
    private readonly _preferences: Preferences;
    private readonly _logger: Logger;

    /**
     * Instantiate {@link WxpSSLReader}.
     * @param Preferences - {@link Preferences} reference.
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link WxpSSLReader} instance.
     */
    constructor(@inject(ICoreTypes.Preferences) preferences: Preferences, @inject(ICoreTypes.Logger) logger: Logger) {
        this._preferences = preferences;
        this._logger = logger;
    }

    /**
     * Is SSL set up manually by the user.
     * @param hostname - Hostname in the SSL certificate.
     * @returns Boolean value representing whether SSL is set up manually.
     */
    isCustomSSL(hostname: string): boolean {
        return this._getUserDefinedSSL(hostname) !== undefined;
    }

    /**
     * Is SSL set up automatically by the tool.
     * @param hostname - Hostname in the SSL certificate.
     * @returns Boolean value representing whether SSL is set up automatically.
     */
    isWxpSSL(hostname: string): boolean {
        return devcert.hasCertificateFor(hostname);
    }

    /**
     * Read the SSL artifacts.
     * @param hostname - Hostname in the SSL certificate.
     * @returns Promise of {@link SSLData}.
     */
    async read(hostname: string): Promise<SSLData> {
        const sslSettings = this._getUserDefinedSSL(hostname);

        // When SSL is set up manuually by the `user`.
        if (sslSettings !== undefined) {
            const { certificatePath, keyPath } = sslSettings;
            if (!certificatePath || !isFile(certificatePath)) {
                this._logger.error(LOGS.invalidCertificatePath);
                return process.exit(1);
            }

            if (!keyPath || !isFile(keyPath)) {
                this._logger.error(LOGS.invalidKeyPath);
                return process.exit(1);
            }

            return {
                cert: fs.readFileSync(certificatePath),
                key: fs.readFileSync(keyPath)
            };
        }

        // When SSL is set up automatically by `devcert`.
        if (this.isWxpSSL(hostname)) {
            return await devcert.certificateFor(hostname);
        }

        this._logger.error(LOGS.noSSLDataFound, { postfix: LOGS.newLine });
        return process.exit(1);
    }

    private _getUserDefinedSSL(hostname: string): SSLSettings | undefined {
        const { ssl } = this._preferences.get();
        if (ssl === undefined) {
            return undefined;
        }

        return ssl.get(hostname);
    }
}

const LOGS = {
    newLine: "\n",
    invalidCertificatePath: "Invalid SSL certificate file path.",
    invalidKeyPath: "Invalid SSL key file path.",
    noSSLDataFound: "No SSL related certificate or key files were found. Please retry after setting them up."
};
