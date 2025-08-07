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
import { OTHER_MANIFEST_ERRORS } from "../AddOnManifestTypes.js";
import { AddOnManifestValidator } from "../AddOnManifestValidator.js";
import type { AddOnManifestDeveloper } from "./utils/TestManifests.js";
import {
    getTestDeveloperManifestV1,
    getTestDeveloperManifestV2,
    getTestManifestV1,
    getTestManifestV2WithDocumentSandbox,
    getTestManifestV2WithScript
} from "./utils/TestManifests.js";

const validator = new AddOnManifestValidator();
const additionInfo = {
    sourceId: "sourceId",
    privileged: false,
    isDeveloperAddOn: true
};

describe("Developer ManifestSchema Validation - Version 1", () => {
    it("should pass for valid manifest", () => {
        const testManifest = getTestDeveloperManifestV1();
        verifyValidManifest(testManifest);
    });

    it("should fail for invalid manifest", () => {
        const testManifest = getTestDeveloperManifestV1();
        const validationResult = validator.validateManifestSchema({ ...testManifest, id: undefined }, additionInfo);
        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0].message, `must have required property 'id'`);
    });

    it("should pass for valid manifest without warnings", () => {
        const testManifest = getTestManifestV1();
        const validationResult = validator.validateManifestSchema(testManifest, additionInfo);
        assert.equal(validationResult.success, true);
        assert.equal(validationResult.errorDetails, undefined);
        assert.equal(validationResult.warningDetails, undefined);
    });

    it("should pass for empty icon array", () => {
        const testManifest = JSON.parse(JSON.stringify(getTestDeveloperManifestV1()));
        emptyIconValidation(testManifest);
    });

    it("should have the required fields", () => {
        const requiredFields = ["id", "entryPoints"];
        verifyRequiredFields(requiredFields, JSON.parse(JSON.stringify(getTestDeveloperManifestV1())));
    });

    it("should have at least one entrypoint", () => {
        const testManifest = JSON.parse(JSON.stringify(getTestDeveloperManifestV1()));
        verifyEntrypoint(testManifest);
    });

    it("should return error message for invalid manifest version type", () => {
        let testManifest = JSON.parse(JSON.stringify(getTestDeveloperManifestV1()));
        testManifest = { ...testManifest, manifestVersion: "version" };
        const { success, errorDetails } = validator.validateManifestSchema(testManifest, additionInfo);
        assert.equal(success, false);
        assert.equal(errorDetails?.[0], OTHER_MANIFEST_ERRORS.ManifestVersionType);
    });
});

describe("Developer ManifestSchema Validation - Version 2", () => {
    it("should pass for valid manifest", () => {
        const testManifest = getTestDeveloperManifestV2();
        verifyValidManifest(testManifest);
    });

    it("should pass for valid 'script' field - undefined or string", () => {
        let testManifest = getTestManifestV2WithScript(undefined);
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, isDeveloperAddOn: true }).success,
            true
        );
        testManifest = getTestManifestV2WithScript("code.js");
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, isDeveloperAddOn: true }).success,
            true
        );
    });

    it("should fail if 'script' field is other than string", () => {
        // @ts-ignore -- negative test case
        const testManifest = getTestManifestV2WithScript({});
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, isDeveloperAddOn: true }).success,
            false
        );
    });

    it("should pass if 'documentSandbox' field is present in entrypoint", () => {
        const testManifest = getTestManifestV2WithDocumentSandbox("code.js");
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, isDeveloperAddOn: true }).success,
            true
        );
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
        assert.equal(
            validator.validateManifestSchema(testManifest, { ...additionInfo, isDeveloperAddOn: true }).success,
            false
        );
    });

    it("should fail for invalid app name", () => {
        const testManifest = getTestDeveloperManifestV2();
        const invalidRequirements = { apps: [{ name: "appName", apiVersion: 1 }] };
        const validationResult = validator.validateManifestSchema(
            { ...testManifest, requirements: invalidRequirements },
            additionInfo
        );
        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0].message, `must match pattern "^(Express)$"`);
    });

    it("should fail and return error response if testId is not defined", () => {
        const testManifest = JSON.parse(JSON.stringify(getTestDeveloperManifestV2()));
        delete testManifest.testId;
        const validationResult = validator.validateManifestSchema(testManifest, additionInfo);
        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.TestIdRequired);
    });

    it("should fail and return error response if 'privilegedApis' is set to true but the add-on is not 'firstParty'", () => {
        const developerManifest = getTestDeveloperManifestV2();
        const privilegedDeveloperManifest = {
            ...developerManifest,
            requirements: { ...developerManifest.requirements, privilegedApis: true }
        };
        const testManifest = JSON.parse(JSON.stringify(privilegedDeveloperManifest));
        additionInfo.privileged = false;

        const validationResult = validator.validateManifestSchema(testManifest, additionInfo);

        assert.equal(validationResult.success, false);
        assert.notEqual(validationResult.errorDetails, undefined);
        assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.RestrictedPrivilegedApis);
    });

    it("should have the required fields", () => {
        const requiredFields = ["version", "manifestVersion", "requirements", "entryPoints"];
        verifyRequiredFields(requiredFields, JSON.parse(JSON.stringify(getTestDeveloperManifestV2())));
    });

    it("should have at least one entrypoint", () => {
        const testManifest = JSON.parse(JSON.stringify(getTestDeveloperManifestV2()));
        verifyEntrypoint(testManifest);
    });

    it("should fail for dev addOn with clipboard-read permission", () => {
        const testManifest = getTestDeveloperManifestV2();
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
});

function verifyValidManifest(testManifest: AddOnManifestDeveloper) {
    const validationResult = validator.validateManifestSchema(testManifest, additionInfo);
    assert.equal(validationResult.success, true);
    assert.equal(validationResult.errorDetails, undefined);
}

function emptyIconValidation(testManifest: AddOnManifestDeveloper) {
    const emptyIconManifest = { ...testManifest, icon: [] };
    const validationResult = validator.validateManifestSchema(emptyIconManifest, additionInfo);
    assert.equal(validationResult.success, true);
    assert.equal(validationResult.errorDetails, undefined);
    assert.equal(validationResult.warningDetails?.[0], OTHER_MANIFEST_ERRORS.EmptyIcon);
}

function verifyRequiredFields(requiredFields: string[], testManifest: { [x: string]: string }) {
    requiredFields.forEach(requiredField => {
        delete testManifest[requiredField];
        assert.equal(validator.validateManifestSchema(testManifest, additionInfo).success, false);
    });
}

function verifyEntrypoint(testManifest: AddOnManifestDeveloper) {
    const emptyEntryPointsManifest = { ...testManifest, entryPoints: [] };
    const validationResult = validator.validateManifestSchema(emptyEntryPointsManifest, additionInfo);
    assert.equal(validationResult.success, false);
    assert.equal(validationResult.errorDetails?.[0], OTHER_MANIFEST_ERRORS.EmptyEntrypoint);
}
