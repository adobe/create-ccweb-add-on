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

import { assert } from "chai";
import "mocha";
import { DEFAULT_HOST_NAME } from "../../constants.js";
import { PreferenceJson } from "../../models/PreferenceJson.js";
import { removeSymbols } from "../../utilities/Extensions.js";

describe("PreferenceJson", () => {
    describe("constructor", () => {
        it("should set required properties to default value when the constructor argument is empty.", () => {
            const preferenceJson = new PreferenceJson({});

            assert.isDefined(preferenceJson);
            assert.isUndefined(preferenceJson.hasTelemetryConsent);
            assert.isUndefined(preferenceJson.clientId);
            assert.isUndefined(preferenceJson.ssl);
        });

        it("should set the properties from the 'content' constructor argument.", () => {
            const content = {
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

            const preferenceJson = new PreferenceJson(content);

            assert.isDefined(preferenceJson);
            assert.equal(preferenceJson.hasTelemetryConsent, content.hasTelemetryConsent);
            assert.equal(preferenceJson.clientId, content.clientId);
            assert.deepEqual(Object.fromEntries(preferenceJson.ssl!), content.ssl);
        });

        it("should set the backward compatible SSL properties from the 'content' constructor argument.", () => {
            const content = {
                hasTelemetryConsent: false,
                clientId: 1096361282655,
                sslCertPath: "/some-directory/localhost/ssl/certificate.cert",
                sslKeyPath: "/some-directory/localhost/ssl/private-key.key"
            };

            const preferenceJson = new PreferenceJson(content);

            assert.isDefined(preferenceJson);
            assert.equal(preferenceJson.hasTelemetryConsent, content.hasTelemetryConsent);
            assert.equal(preferenceJson.clientId, content.clientId);
            assert.deepEqual(Object.fromEntries(preferenceJson.ssl!), {
                [DEFAULT_HOST_NAME]: {
                    certificatePath: content.sslCertPath,
                    keyPath: content.sslKeyPath
                }
            });
        });

        it("should set the latest SSL version when both versions are present in the 'content' constructor argument.", () => {
            const content = {
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
                },
                sslCertPath: "/some-directory/localhost/ssl/certificate.cert",
                sslKeyPath: "/some-directory/localhost/ssl/private-key.key"
            };

            const preferenceJson = new PreferenceJson(content);

            assert.isDefined(preferenceJson);
            assert.equal(preferenceJson.hasTelemetryConsent, content.hasTelemetryConsent);
            assert.equal(preferenceJson.clientId, content.clientId);
            assert.deepEqual(Object.fromEntries(preferenceJson.ssl!), content.ssl);
        });
    });

    describe("toJSON", () => {
        const runs = [
            {
                content: {
                    hasTelemetryConsent: true,
                    clientId: 1096361282655
                }
            },
            {
                content: {
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
                }
            }
        ];

        runs.forEach(run => {
            it("should return stringify-ed PreferenceJson with properties except for the undefined ones.", () => {
                const preferenceJson = new PreferenceJson(run.content);
                const preferenceJsonString = preferenceJson.toJSON();

                assert.equal(
                    removeSymbols(preferenceJsonString),
                    removeSymbols(JSON.stringify(run.content, undefined, 4))
                );
            });
        });
    });
});
