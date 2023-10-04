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
/**
 * SSL related settings.
 */
export interface SSLSettings {
    /**
     * Path of the SSL certificate file.
     */
    certificatePath: string;
    /**
     * Path of the SSL key file.
     */
    keyPath: string;
}
/**
 * Class representing CCWeb Add-on CLI related preferences.
 */
export declare class PreferenceJson {
    /**
     * stores user consent to collect telemetry data
     */
    hasTelemetryConsent?: boolean;
    /**
     * stores the auth_token and refresh_token
     */
    ims?: {
        [k: string]: unknown;
    };
    /**
     * stores the clientId used to identify client while sending analytics
     */
    clientId?: number;
    /**
     * Map of SSL settings corresponding to a unique hostname.
     */
    ssl?: Map<string, SSLSettings>;
    /**
     * Instantiate {@link PreferenceJson}.
     * @param content - JSON file content.
     * @returns Reference to a new {@link PreferenceJson} instance.
     */
    constructor(content: {
        [k: string]: unknown;
    });
    /**
     * Get JSON representation of this {@link PreferenceJson} reference.
     * @returns JSON representation as string.
     */
    toJSON(): string;
    /**
     * Support V1 and V2 of SSL contract.
     * @param content - JSON file content.
     * @returns Map of SSL settings corresponding to a unique hostname.
     */
    private _getSSL;
}
//# sourceMappingURL=PreferenceJson.d.ts.map