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
import sinon from "sinon";
import { AddOnManifestType, ManifestVersion } from "../AddOnManifest.js";
import {
    AddOnLogAction,
    AddOnLogLevel,
    App,
    AuthorInfo,
    EntrypointV1,
    IconType,
    LocalisedStrings,
    ManifestEntrypoint,
    OTHER_MANIFEST_ERRORS,
    RequirementsV1,
    Size
} from "../AddOnManifestTypes.js";
import { AddOnManifestValidator } from "../AddOnManifestValidator.js";
import {
    getTestManifestV1,
    getTestManifestV2,
    getTestManifestV2WithDocumentSandbox,
    getTestManifestV2WithScript
} from "./utils/TestManifests.js";

const _addOnLogger: Map<AddOnLogLevel, AddOnLogAction> | undefined = new Map([
    [AddOnLogLevel.error, (...args: unknown[]) => console.log(args)],
    [AddOnLogLevel.warning, (...args: unknown[]) => console.warn(args)]
]);

const validator = new AddOnManifestValidator(_addOnLogger);
const ManifestError = {
    InvalidName: `must match pattern "^[a-zA-Z0-9]+[a-zA-Z0-9 ]{2,44}$"`,
    InvalidVersion: `must match pattern "^[0-9]+.[0-9]+.[0-9]+$"`
};
const additionInfo = {
    sourceId: "sourceId",
    privileged: false,
    isDeveloperAddOn: false
};

function testValidInvalidPatterns(
    applyTest: (manifest: AddOnManifestType<ManifestVersion.V1>, key: string) => void,
    validPatterns: string[],
    invalidPatterns: string[]
) {
    validPatterns.forEach(validPattern => {
        const testManifest = getTestManifestV1();
        applyTest(testManifest, validPattern);
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, privileged: true }).success,
            true
        );
    });

    invalidPatterns.forEach(invalidPattern => {
        const testManifest = getTestManifestV1();
        applyTest(testManifest, invalidPattern);
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, privileged: true }).success,
            false
        );
    });
}

function testValidInvalidPatternsV2(
    applyTest: (manifest: AddOnManifestType<ManifestVersion.V2>, key: string) => void,
    validPatterns: string[],
    invalidPatterns: string[]
) {
    validPatterns.forEach(validPattern => {
        const testManifest = getTestManifestV2();
        applyTest(testManifest, validPattern);
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, privileged: true }).success,
            true
        );
    });

    invalidPatterns.forEach(invalidPattern => {
        const testManifest = getTestManifestV2();
        applyTest(testManifest, invalidPattern);
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, privileged: true }).success,
            false
        );
    });
}

type MutableObject<T> = {
    -readonly [K in keyof T]: T[K];
};

describe("ManifestSchema Validations - Version 1", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        sandbox.stub(console, "log");
        sandbox.stub(console, "error");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should pass for valid manifest", () => {
        const testManifest = getTestManifestV1();
        verifyValidSchema(testManifest);
    });

    it("should fail if undefined is passed", () => {
        const validationResult = validator.validateManifestSchema(undefined, additionInfo);
        assert.equal(validationResult.success, false);
        assert.equal(validationResult.errorDetails, undefined);
    });

    it("should fail when additional properties are passed", () => {
        const testManifest = getTestManifestV1();
        const requirements = { ...testManifest.requirements, experimentalApis: true };
        const validationResult = validator.validateManifestSchema({ ...testManifest, requirements }, additionInfo);
        assert.equal(validationResult.success, false);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.AdditionPropertyExperimentalApis);
    });

    it("should have the required fields", () => {
        const requiredFields = ["id", "name", "version", "manifestVersion", "requirements", "icon", "entryPoints"];
        const testManifest = JSON.parse(JSON.stringify(getTestManifestV1()));
        verifyRequiredFields(requiredFields, testManifest);
    });

    it("should have the required fields for Requirements", () => {
        const requiredFields: (keyof RequirementsV1)[] = ["apps"];
        requiredFields.forEach(requiredField => {
            const testManifest = getTestManifestV1();
            delete testManifest.requirements[requiredField];
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
        });
    });

    it("should have the required fields for Icon", () => {
        const requiredFields: (keyof IconType)[] = ["href", "theme"];
        requiredFields.forEach(requiredField => {
            const testManifest = getTestManifestV1();
            const iconType = testManifest.icon! as IconType[];
            delete iconType[0][requiredField];
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
        });
    });

    it("should have the required fields for Entrypoints", () => {
        const requiredFields: (keyof EntrypointV1)[] = ["type", "id", "label", "main"];
        requiredFields.forEach(requiredField => {
            const testManifest = getTestManifestV1();
            delete testManifest.entryPoints[0][requiredField];
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
        });
    });

    it("should have the required fields for Entrypoint label", () => {
        const requiredFields: (keyof LocalisedStrings)[] = ["default"];
        requiredFields.forEach(_requiredField => {
            const testManifest = getTestManifestV1();
            (testManifest.entryPoints[0] as MutableObject<EntrypointV1>).label = {} as LocalisedStrings;
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
        });
    });

    it("should have the required fields Entrypoint deafultSize", () => {
        const requiredFields: (keyof Size)[] = ["width", "height"];
        requiredFields.forEach(requiredField => {
            const testManifest = getTestManifestV1();
            const size = testManifest.entryPoints[0].defaultSize!;
            delete size[requiredField];
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
        });
    });

    it("should have the required fields for AuthorInfo", () => {
        const requiredFields: (keyof AuthorInfo)[] = ["name", "email"];
        requiredFields.forEach(requiredField => {
            const testManifest = getTestManifestV1();
            const authorInfo = testManifest.authorInfo;
            if (authorInfo) {
                delete authorInfo[requiredField];
                assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
            }
        });
    });

    it("should have a valid entry point type", () => {
        const validTypePatterns = [
            "panel",
            "mobile.media.audio",
            "mobile.your-stuff.files",
            "contextual.replace",
            "contextual.upload",
            "contextual.bulk-create"
        ];
        const invalidTypePatterns = ["widgets", "panels", "mobile.media", "mobile.your-stuff", "contextual.insert"];

        const testFn = (manifest: ReturnType<typeof JSON.parse>, value: string) => {
            (manifest.entryPoints[0] as MutableObject<ManifestEntrypoint>).type = value;
        };

        testValidInvalidPatterns(testFn, validTypePatterns, invalidTypePatterns);
    });

    it("should have valid widget permissions", () => {
        const validSandboxPatterns = [
            "allow-popups",
            "allow-presentation",
            "allow-downloads",
            "allow-popups-to-escape-sandbox",
            "allow-forms"
        ];
        const invalidSandboxPatterns = ["allow-modals", "allow-top-navigation-by-user-activation"];

        const testFn = (manifest: ReturnType<typeof JSON.parse>, value: string) => {
            const sandboxPermissions = manifest.entryPoints[0].permissions!.sandbox || [];
            (sandboxPermissions[0] as MutableObject<string>) = value;
        };

        testValidInvalidPatterns(testFn, validSandboxPatterns, invalidSandboxPatterns);
    });

    it("should not pass for invalid permissions type in manifest", () => {
        const testManifest = getTestManifestV1();
        const manifest = {
            ...testManifest,
            entryPoints: [{ ...testManifest.entryPoints[0], permissions: { camera: 1, microphone: 1 } }]
        };
        assert.equal(validator.validateManifestSchema(manifest, additionInfo).success, false);
    });

    it("should have valid widget Icon theme", () => {
        const validIconPatterns = ["lightest", "light", "medium", "dark", "darkest", "all"];
        const invalidIconPatterns = ["lighttest", "drk"];

        const testFn = (manifest: ReturnType<typeof JSON.parse>, value: string) => {
            const iconArray = manifest.icon! as IconType[];

            if (iconArray[0].theme) {
                (iconArray[0].theme[0] as MutableObject<string>) = value;
            }
        };

        testValidInvalidPatterns(testFn, validIconPatterns, invalidIconPatterns);
    });

    it("should have valid Apps field", () => {
        const validAppPatterns = ["Express"];
        const invalidAppPatterns = ["Cnvas", "canva", "Spice", "CCX"];

        const testFn = (manifest: ReturnType<typeof JSON.parse>, value: string) => {
            (manifest.requirements.apps[0] as MutableObject<string>) = value;
        };

        testValidInvalidPatterns(testFn, validAppPatterns, invalidAppPatterns);
    });

    it("should have at least one entrypoint", () => {
        const testManifest = JSON.parse(JSON.stringify(getTestManifestV1()));
        verifyEntrypoint(testManifest);
    });

    it("should have at least one icon", () => {
        let testManifest = JSON.parse(JSON.stringify(getTestManifestV1()));
        testManifest = { ...testManifest, icon: [] };
        const { success, errorDetails } = validator.validateManifestSchema(testManifest, additionInfo);
        assert.equal(success, false);
        assert.equal(errorDetails?.[0], OTHER_MANIFEST_ERRORS.EmptyIcon);
    });

    it("should return error message for invalid manifest version", () => {
        let testManifest = JSON.parse(JSON.stringify(getTestManifestV1()));
        testManifest = { ...testManifest, manifestVersion: -1 };
        const { success, errorDetails } = validator.validateManifestSchema(testManifest, additionInfo);
        assert.equal(success, false);
        assert.equal(errorDetails?.[0], OTHER_MANIFEST_ERRORS.InvalidManifestVersion);
    });

    it("should return error message for invalid manifest version", () => {
        let testManifest = JSON.parse(JSON.stringify(getTestManifestV1()));
        testManifest = { ...testManifest, manifestVersion: 0 };
        const { success, errorDetails } = validator.validateManifestSchema(testManifest, additionInfo);
        assert.equal(success, false);
        assert.equal(errorDetails?.[0], OTHER_MANIFEST_ERRORS.InvalidManifestVersion);
    });

    it("should return error message for invalid type of name field", () => {
        let testManifest = JSON.parse(JSON.stringify(getTestManifestV1()));
        testManifest = { ...testManifest, name: 123 };
        const { success, errorDetails } = validator.validateManifestSchema(testManifest, additionInfo);
        assert.equal(success, false);
        const validationError = {
            instancePath: "/name",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
        };
        assert.deepEqual(errorDetails?.[0], validationError);
    });

    it("should support all valid permissions", () => {
        const testManifest = getTestManifestV1();
        const manifest = {
            ...testManifest,
            entryPoints: [
                {
                    ...testManifest.entryPoints[0],
                    permissions: {
                        camera: "*",
                        microphone: "*",
                        sandbox: [
                            "allow-popups",
                            "allow-presentation",
                            "allow-downloads",
                            "allow-popups-to-escape-sandbox"
                        ],
                        oauth: ["url1"]
                    }
                }
            ]
        };
        assert.equal(validator.validateManifestSchema(manifest, additionInfo).success, true);
    });
});

describe("ManifestSchema Validations - Version 2", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        sandbox.stub(console, "log");
        sandbox.stub(console, "error");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should pass for valid manifest", () => {
        const testManifest = getTestManifestV2();
        verifyValidSchema(testManifest);
    });

    it("should fail when undefined manifest is passed", () => {
        const validationResult = validator.validateManifestSchema(undefined, additionInfo);
        assert.equal(validationResult.success, false);
        assert.equal(validationResult.errorDetails, undefined);
    });

    it("should support valid name values", () => {
        const testManifest = getTestManifestV2();
        const validManifestName = ["abc", "123", "addOn1", "addOn 2"];
        validManifestName.forEach(name => {
            verifyValidSchema({ ...testManifest, name });
        });
    });

    it("should fail when invalid name field is passed", () => {
        const testManifest = getTestManifestV2();
        const invalidManifestName = [
            "###",
            "a",
            "ab",
            " ",
            " 12",
            "fail for invalid manifest name longer than 45 characters"
        ];
        invalidManifestName.forEach(name => {
            const validateInvalidName = validator.validateManifestSchema({ ...testManifest, name }, additionInfo);
            assert.equal(validateInvalidName.errorDetails?.[0].message, ManifestError.InvalidName);
        });
    });

    it("should fail for 3P addOn with clipboard-read permission", () => {
        const testManifest = getTestManifestV2();
        const entryPoints = [
            {
                ...testManifest.entryPoints[0],
                permissions: {
                    clipboard: ["clipboard-read"]
                }
            }
        ];
        const { success, errorDetails } = validator.validateManifestSchema(
            { ...testManifest, entryPoints },
            additionInfo
        );
        assert.equal(success, false);
        assert.equal(errorDetails?.[0], OTHER_MANIFEST_ERRORS.InvalidClipboardPermission);
    });

    it("should fail for invalid host name", () => {
        const testManifest = getTestManifestV2();
        const invalidHostDomains = [
            "",
            "*",
            "https://",
            "https://.",
            "https://a",
            "https://a.a",
            "https://adobe.",
            "https://adobe..",
            "https://.com",
            "http://localhost.adobe.com"
        ];
        invalidHostDomains.forEach(hostDomain => {
            const entryPoints = [
                {
                    ...testManifest.entryPoints[0],
                    hostDomain
                }
            ];
            const { success, errorDetails } = validator.validateManifestSchema(
                { ...testManifest, entryPoints },
                additionInfo
            );
            assert.equal(success, false);
            assert.equal(errorDetails?.[0], OTHER_MANIFEST_ERRORS.InvalidHostDomain);
        });
    });

    it("should pass for valid hostName", () => {
        const testManifest = getTestManifestV2();
        const validHostDomains = [
            "https://localhost.adobe.com",
            "https://ci-hub.azureweb.net/",
            "https://ci-hub.azureweb.net/index.html",
            "https://example.com:8080/path/to/resource",
            "https://example.com/path/to/resource?param1=value1"
        ];
        validHostDomains.forEach(hostDomain => {
            const entryPoints = [
                {
                    ...testManifest.entryPoints[0],
                    hostDomain
                }
            ];
            const { success, errorDetails } = validator.validateManifestSchema(
                { ...testManifest, entryPoints },
                additionInfo
            );
            assert.equal(success, true);
            assert.equal(errorDetails, undefined);
        });
    });

    it("should support valid version values", () => {
        const testManifest = getTestManifestV2();
        const validManifestVersion = ["1.1.1", "1.0.0", "99.0.1"];
        validManifestVersion.forEach(version => {
            verifyValidSchema({ ...testManifest, version });
        });
    });

    it("should fail when invalid version field is passed", () => {
        const testManifest = getTestManifestV2();
        const invalidManifestVersion = ["1", "1.1", "a.b.c"];
        invalidManifestVersion.forEach(version => {
            const validateInvalidVersion = validator.validateManifestSchema({ ...testManifest, version }, additionInfo);
            assert.equal(validateInvalidVersion.errorDetails?.[0].message, ManifestError.InvalidVersion);
        });
    });

    it("should fail when additional properties are passed", () => {
        const testManifest = getTestManifestV2();
        const requirements = { ...testManifest.requirements, experimentalApis: true };
        const validationResult = validator.validateManifestSchema({ ...testManifest, requirements }, additionInfo);
        assert.equal(validationResult.success, false);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.AdditionPropertyExperimentalApis);
    });

    it("should fail and return error response if privilegedApis are not supported", () => {
        let testManifest = getTestManifestV2();
        const additionalAddOnInfo = { ...additionInfo, privileged: false };
        testManifest = { ...testManifest, requirements: { ...testManifest.requirements, privilegedApis: true } };
        const validationResult = validator.validateManifestSchema(testManifest, additionalAddOnInfo);
        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.RestrictedPrivilegedApis);
    });

    it("should not fail for privilegedApis ", () => {
        let testManifest = JSON.parse(JSON.stringify(getTestManifestV2()));
        testManifest = { ...testManifest, requirements: { ...testManifest.requirements, privilegedApis: false } };
        verifyValidSchema(testManifest);
        delete testManifest.requirements.privilegedApis;
        verifyValidSchema(testManifest);
    });

    it("should have the required fields", () => {
        const requiredFields = ["version", "manifestVersion", "requirements", "entryPoints"];
        const testManifest = JSON.parse(JSON.stringify(getTestManifestV2()));
        verifyRequiredFields(requiredFields, testManifest);
    });

    it("should have the required fields for Requirements App", () => {
        const requiredFields: (keyof App)[] = ["name", "apiVersion"];
        requiredFields.forEach(requiredField => {
            const testManifest = getTestManifestV2();
            delete testManifest.requirements.apps[0][requiredField];
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
        });
    });

    it("should have renditionPreview as boolean value", () => {
        const testManifest = getTestManifestV2();
        assert.equal(typeof testManifest.requirements.renditionPreview === "boolean", true);
        assert.equal(testManifest.requirements.renditionPreview, true);
    });

    it("should have _blessedPartnerAccess as string value", () => {
        const testManifest = getTestManifestV2();
        assert.equal(typeof testManifest.requirements._blessedPartnerAccess === "string", true);
        assert.equal(testManifest.requirements._blessedPartnerAccess, "blessedPartnerAccess");
    });

    it("should have the required fields for trustedPartnerApis", () => {
        const testManifest = getTestManifestV2();
        assert.equal(typeof testManifest.requirements.trustedPartnerApis === "object", true);
        assert.equal(typeof testManifest.requirements.trustedPartnerApis?.messaging === "boolean", true);
        assert.equal(typeof testManifest.requirements.trustedPartnerApis?.expressPrint === "boolean", true);
        assert.equal(typeof testManifest.requirements.trustedPartnerApis?.toastNotifications === "boolean", true);
        assert.equal(typeof testManifest.requirements.trustedPartnerApis?.addOnLifecycle === "boolean", true);
        assert.equal(typeof testManifest.requirements.trustedPartnerApis?.formSubmission === "boolean", true);
        assert.equal(typeof testManifest.requirements.trustedPartnerApis?.tiktokcml === "boolean", true);
        assert.equal(testManifest.requirements.trustedPartnerApis?.messaging, false);
        assert.equal(testManifest.requirements.trustedPartnerApis?.expressPrint, true);
        assert.equal(testManifest.requirements.trustedPartnerApis?.addOnLifecycle, false);
        assert.equal(testManifest.requirements.trustedPartnerApis?.toastNotifications, false);
        assert.equal(testManifest.requirements.trustedPartnerApis?.tiktokcml, true);
        assert.equal(testManifest.requirements.trustedPartnerApis?.formSubmission, true);
    });

    it("should have at least one entrypoint", () => {
        const testManifest = JSON.parse(JSON.stringify(getTestManifestV2()));
        verifyEntrypoint(testManifest);
    });

    it("should support all valid permissions", () => {
        const testManifest = getTestManifestV2();
        const manifest = {
            ...testManifest,
            entryPoints: [
                {
                    ...testManifest.entryPoints[0],
                    permissions: {
                        camera: "*",
                        microphone: "*",
                        sandbox: [
                            "allow-popups",
                            "allow-presentation",
                            "allow-downloads",
                            "allow-popups-to-escape-sandbox"
                        ],
                        oauth: ["url1"],
                        clipboard: ["clipboard-write"]
                    }
                }
            ]
        };
        assert.equal(validator.validateManifestSchema(manifest, additionInfo).success, true);
    });

    it("should support all valid permissions for privileged addOn", () => {
        const testManifest = getTestManifestV2(true);
        const manifest = {
            ...testManifest,
            entryPoints: [
                {
                    ...testManifest.entryPoints[0],
                    permissions: {
                        camera: "*",
                        microphone: "*",
                        sandbox: [
                            "allow-popups",
                            "allow-presentation",
                            "allow-downloads",
                            "allow-popups-to-escape-sandbox"
                        ],
                        oauth: ["url1"],
                        clipboard: ["clipboard-write", "clipboard-read"]
                    }
                }
            ]
        };
        const res = validator.validateManifestSchema(manifest, { ...additionInfo, privileged: true });
        assert.equal(res.success, true);
    });

    it("should fail and return error response if content hub entrypoint type is used by non-privileged add-on", () => {
        const manifest = getTestManifestV2();
        const testManifest = {
            ...manifest,
            entryPoints: [
                {
                    ...manifest.entryPoints[0],
                    type: "content-hub"
                }
            ]
        };
        const additionalAddOnInfo = { ...additionInfo, privileged: false };
        const validationResult = validator.validateManifestSchema(testManifest, additionalAddOnInfo);
        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.RestrictedContentHubEntrypoint);
    });

    it("should succeed for 'allow-forms' sanbox property with trusted flag or privileged", () => {
        const manifest = getTestManifestV2();
        const testManifest = {
            ...manifest,
            requirements: {
                ...manifest.requirements,
                trustedPartnerApis: {
                    formSubmission: true
                }
            },
            entryPoints: [
                {
                    ...manifest.entryPoints[0],
                    permissions: {
                        sandbox: ["allow-forms"]
                    }
                }
            ]
        };
        let additionalAddOnInfo = { ...additionInfo, privileged: false };
        let validationResult = validator.validateManifestSchema(testManifest, additionalAddOnInfo);
        assert.equal(validationResult.success, true);
        assert.equal(validationResult.errorDetails, undefined);

        const manifestWithoutTrustedApi = {
            ...testManifest,
            requirements: {
                ...testManifest.requirements,
                trustedPartnerApis: {}
            }
        };

        additionalAddOnInfo = { ...additionInfo, privileged: true };
        validationResult = validator.validateManifestSchema(manifestWithoutTrustedApi, additionalAddOnInfo);
        assert.equal(validationResult.success, true);
        assert.equal(validationResult.errorDetails, undefined);
    });

    it("should fail and return error response if 'allow-forms' is used for entrypoint without the trusted flag", () => {
        const manifest = getTestManifestV2();
        const testManifest = {
            ...manifest,
            requirements: {
                ...manifest.requirements,
                trustedPartnerApis: {
                    formSubmission: false
                }
            },
            entryPoints: [
                {
                    ...manifest.entryPoints[0],
                    permissions: {
                        sandbox: ["allow-forms"]
                    }
                }
            ]
        };
        const additionalAddOnInfo = { ...additionInfo, privileged: false };
        let validationResult = validator.validateManifestSchema(testManifest, additionalAddOnInfo);
        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.RestrictedFormsSandboxProperty);

        const manifestWithoutTrustedApi = {
            ...testManifest,
            requirements: {
                ...testManifest.requirements,
                trustedPartnerApis: {}
            }
        };
        validationResult = validator.validateManifestSchema(manifestWithoutTrustedApi, additionalAddOnInfo);
        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.RestrictedFormsSandboxProperty);
    });

    it("should have a valid entry point type", () => {
        const validTypePatterns = [
            "panel",
            "mobile.media.audio",
            "mobile.your-stuff.files",
            "contextual.replace",
            "contextual.upload",
            "contextual.bulk-create"
        ];
        const invalidTypePatterns = ["widgets", "panels", "mobile.media", "mobile.your-stuff", "contextual.insert"];

        const testFn = (manifest: ReturnType<typeof JSON.parse>, value: string) => {
            (manifest.entryPoints[0] as MutableObject<ManifestEntrypoint>).type = value;
        };

        testValidInvalidPatternsV2(testFn, validTypePatterns, invalidTypePatterns);
    });

    it("should have a valid deviceClassPattern", () => {
        const validTypePatterns = ["desktop", "mobile", "app", "mobile-ios", "mobile-android"];
        const invalidTypePatterns = ["mobile-app", "web"];
        const testFn = (manifest: ReturnType<typeof JSON.parse>, value: string) => {
            (manifest.requirements.apps[0] as MutableObject<App>).supportedDeviceClass = [value];
        };
        testValidInvalidPatternsV2(testFn, validTypePatterns, invalidTypePatterns);
    });

    describe("ManifestSchema Validation with 'script' field", () => {
        it("should pass if 'script' field is undefined", () => {
            const testManifest = getTestManifestV2WithScript(undefined);
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, true);
        });

        it("should pass if 'script' field is string", () => {
            const testManifest = getTestManifestV2WithScript("code.js");
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, true);
        });

        it("should fail if 'script' field is other than string", () => {
            // @ts-ignore -- negative test case
            const testManifest = getTestManifestV2WithScript({});
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
            assert.equal(
                validator.validateManifestSchema(testManifest, { ...additionInfo, isDeveloperAddOn: true }).success,
                false
            );
        });

        it("should pass if 'documentSandbox' field is present in entrypoint", () => {
            const testManifest = getTestManifestV2WithDocumentSandbox("code.js");
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, true);
        });

        it("should fail if both 'script' and 'documentSandbox' fields are present in entrypoint", () => {
            const manifest = getTestManifestV2WithDocumentSandbox("code.js");
            const testManifest = {
                ...manifest,
                entryPoints: [
                    {
                        ...manifest.entryPoints[0],
                        script: "code.js"
                    }
                ]
            };
            assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
        });
    });
});

function verifyValidSchema(testManifest: ReturnType<typeof JSON.parse>) {
    const validationResult = validator.validateManifestSchema(testManifest, additionInfo);
    assert.equal(validationResult.success, true);
    assert.equal(validationResult.errorDetails, undefined);
}

function verifyRequiredFields(requiredFields: string[], testManifest: { [x: string]: string }) {
    requiredFields.forEach(requiredField => {
        delete testManifest[requiredField];
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, isDeveloperAddOn: true }).success,
            false
        );
    });
}

function verifyEntrypoint(testManifest: ReturnType<typeof JSON.parse>) {
    const emptyEntryPointsManifest = { ...testManifest, entryPoints: [] };
    const { success, errorDetails } = validator.validateManifestSchema(emptyEntryPointsManifest, additionInfo);
    assert.equal(success, false);
    assert.equal(errorDetails?.[0], OTHER_MANIFEST_ERRORS.EmptyEntrypoint);
}
