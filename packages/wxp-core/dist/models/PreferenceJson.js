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
import { DEFAULT_HOST_NAME } from "../constants.js";
import { getJSONString, isNullOrWhiteSpace, isObject } from "../utilities/index.js";
/**
 * Class representing CCWeb Add-on CLI related preferences.
 */
export class PreferenceJson {
    /**
     * stores user consent to collect telemetry data
     */
    hasTelemetryConsent;
    /**
     * stores the auth_token and refresh_token
     */
    ims;
    /**
     * stores the clientId used to identify client while sending analytics
     */
    clientId;
    /**
     * Map of SSL settings corresponding to a unique hostname.
     */
    ssl;
    /**
     * Instantiate {@link PreferenceJson}.
     * @param content - JSON file content.
     * @returns Reference to a new {@link PreferenceJson} instance.
     */
    constructor(content) {
        this.ssl = this._getSSL(content);
        this.hasTelemetryConsent = content.hasTelemetryConsent;
        this.ims = content.ims;
        this.clientId = content.clientId;
    }
    /**
     * Get JSON representation of this {@link PreferenceJson} reference.
     * @returns JSON representation as string.
     */
    toJSON() {
        return getJSONString({
            hasTelemetryConsent: this.hasTelemetryConsent,
            ims: this.ims,
            clientId: this.clientId,
            ssl: this.ssl ? Object.fromEntries(this.ssl) : undefined
        });
    }
    /**
     * Support V1 and V2 of SSL contract.
     * @param content - JSON file content.
     * @returns Map of SSL settings corresponding to a unique hostname.
     */
    _getSSL(content) {
        if (isObject(content.ssl)) {
            return new Map(Object.entries(content.ssl));
        }
        // Backward compatibility for `sslCertPath` and `sslKeyPath`
        // which mapped to `localhost` hostname in manually configured SSL.
        const certificatePath = content.sslCertPath;
        const keyPath = content.sslKeyPath;
        if (!isNullOrWhiteSpace(certificatePath) && !isNullOrWhiteSpace(keyPath)) {
            return new Map([[DEFAULT_HOST_NAME, { certificatePath, keyPath }]]);
        }
        return undefined;
    }
}
//# sourceMappingURL=PreferenceJson.js.map