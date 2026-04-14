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
import { AddOnManifest, ManifestVersion } from "../AddOnManifest.js";
import type { AddOnLogAction } from "../AddOnManifestTypes.js";
import { AddOnLogLevel, OTHER_MANIFEST_ERRORS } from "../AddOnManifestTypes.js";
import type { AddOnManifestApp } from "../manifest-field/AddOnManifestApp.js";
import { DEFAULT_SUPPORTED_DEVICE_CLASS } from "../manifest-field/AddOnManifestApp.js";
import {
    getTestDeveloperManifestV1,
    getTestManifestV1,
    getTestManifestV2,
    getTestManifestV2WithScript
} from "./utils/TestManifests.js";

const additionalInfo = {
    sourceId: "addOn-sourceId",
    privileged: false,
    isDeveloperAddOn: false
};

describe("AddOnManifest", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        sandbox.stub(console, "log");
        sandbox.stub(console, "error");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should return manifest", () => {
        const testManifest = getTestManifestV1() as ReturnType<typeof JSON.parse>;
        const { manifest: addOnManifest } = AddOnManifest.createManifest({ manifest: testManifest, additionalInfo });
        assert.notEqual(addOnManifest, undefined);

        const manifest = addOnManifest?.manifestProperties;
        assert.notEqual(manifest as Record<string, unknown>, undefined);

        assert.notEqual(manifest?.entryPoints, undefined);
        assert.notEqual(manifest?.entryPoints as Record<string, unknown>, undefined);
        assert.notEqual((manifest?.entryPoints as Record<string, unknown>).length, 0);
        assert.deepEqual(manifest?.entryPoints, testManifest.entryPoints);
    });

    const _addOnLogger: Map<AddOnLogLevel, AddOnLogAction> | undefined = new Map([
        [AddOnLogLevel.error, (...args: unknown[]) => console.log(args)],
        [AddOnLogLevel.warning, (...args: unknown[]) => console.warn(args)]
    ]);

    it("should return AddOn - Manifest Version 1", () => {
        const testManifest = getTestManifestV1() as ReturnType<typeof JSON.parse>;
        const { manifest } = AddOnManifest.createManifest({ manifest: testManifest, additionalInfo }, _addOnLogger);

        verifyCommonManifestFields(manifest, testManifest);
        assert.notEqual(manifest, undefined);
        if (!manifest) {
            return;
        }
        assert.equal(manifest.id, testManifest.id);
        assert.equal(manifest.name, testManifest.name);
        assert.equal(manifest.version, testManifest.version);
        assert.equal(manifest.icon, testManifest.icon);
        assert.equal(manifest.authorInfo, testManifest.authorInfo);

        assert.equal(manifest.entryPoints[0].label, testManifest.entryPoints[0].label);
        assert.equal(manifest.entryPoints[0].defaultSize, testManifest.entryPoints[0].defaultSize);
        assert.equal(manifest.entryPoints[0].commands, undefined);
        assert.equal(manifest.requirements.apps, testManifest.requirements.apps);
        assert.equal(manifest.requirements.privilegedApis, false);
        assert.equal(false, manifest.requirements.supportsTouch);
        assert.equal(false, manifest.requirements.renditionPreview);
        assert.equal(manifest.entryPoints[0].documentSandbox, undefined);
    });

    it("should return AddOn - Manifest Version 2", () => {
        const testManifest = getTestManifestV2() as ReturnType<typeof JSON.parse>;
        testManifest.name = "Test Add on";

        const { manifest } = AddOnManifest.createManifest({ manifest: testManifest, additionalInfo }, _addOnLogger);

        verifyCommonManifestFields(manifest, testManifest);

        assert.notEqual(manifest, undefined);
        if (!manifest) {
            return;
        }
        assert.equal(manifest.id, "");
        assert.equal(manifest.name, "Test Add on");
        assert.equal(manifest.icon, undefined);
        assert.equal(manifest.authorInfo, undefined);

        assert.equal(manifest.entryPoints[0].label, undefined);
        assert.equal(manifest.entryPoints[0].defaultSize, testManifest.entryPoints[0].defaultSize);
        assert.deepEqual(manifest.entryPoints[1].commands, testManifest.entryPoints[1].commands);

        const apps = manifest.requirements.apps as AddOnManifestApp[];
        assert.equal(testManifest.requirements.supportsTouch, manifest.requirements.supportsTouch);
        assert.equal(testManifest.requirements.renditionPreview, manifest.requirements.renditionPreview);
        assert.equal(manifest.requirements.privilegedApis, testManifest.requirements.privilegedApis);

        assert.equal(apps[0].name, testManifest.requirements.apps[0].name);
        assert.equal(apps[0].apiVersion, testManifest.requirements.apps[0].apiVersion);
        assert.equal(apps[0].supportedDeviceClass, testManifest.requirements.apps[0].supportedDeviceClass);

        assert.equal(apps[1].name, testManifest.requirements.apps[1].name);
        assert.equal(apps[1].apiVersion, testManifest.requirements.apps[1].apiVersion);
        assert.equal(apps[1].supportedDeviceClass, DEFAULT_SUPPORTED_DEVICE_CLASS);
    });

    it("should return undefined name for an unsupported manifest version", () => {
        const testManifest = getTestManifestV2() as ReturnType<typeof JSON.parse>;
        const { manifest } = AddOnManifest.createManifest({ manifest: testManifest, additionalInfo });
        assert.notEqual(manifest, undefined);
        if (!manifest) {
            return;
        }
        // @ts-ignore - This is a test to simulate an unsupported manifest version
        manifest["_manifest"].manifestVersion = 99;
        assert.equal(manifest.name, undefined);
    });

    it("should return default manifestVersion for dev AddOn", () => {
        const devManifest = getTestDeveloperManifestV1() as ReturnType<typeof JSON.parse>;
        delete devManifest.manifestVersion;
        const { manifest } = AddOnManifest.createManifest(
            { manifest: devManifest, additionalInfo: { ...additionalInfo, isDeveloperAddOn: true } },
            _addOnLogger
        );

        assert.equal(ManifestVersion.V1, manifest?.manifestVersion);
    });

    it("should return AddOn - Manifest Version 2 with script", () => {
        const testManifest = getTestManifestV2WithScript("code.js") as ReturnType<typeof JSON.parse>;
        const manifest = AddOnManifest.createManifest({ manifest: testManifest, additionalInfo }).manifest!;

        verifyCommonManifestFields(manifest, testManifest);
        assert.equal(manifest.entryPoints[0].documentSandbox, testManifest.entryPoints[0].script);
    });

    it("should return error for invalid manifest", () => {
        const testManifest = getTestManifestV1() as ReturnType<typeof JSON.parse>;
        delete testManifest.entryPoints;
        const { manifest, manifestValidationResult } = AddOnManifest.createManifest(
            {
                manifest: testManifest,
                additionalInfo
            },
            _addOnLogger
        );
        assert.equal(manifest, undefined);
        assert.equal(manifestValidationResult.success, false);
        assert.equal(manifestValidationResult.errorDetails?.[1], OTHER_MANIFEST_ERRORS.EmptyEntrypoint);
    });
});

function verifyCommonManifestFields(
    manifest: ReturnType<typeof JSON.parse>,
    testManifest: ReturnType<typeof JSON.parse>
) {
    assert.equal(manifest.manifestVersion, testManifest.manifestVersion);
    assert.equal(manifest.entryPoints[0].type, testManifest.entryPoints[0].type);
    assert.equal(manifest.entryPoints[0].id, testManifest.entryPoints[0].id);
    assert.equal(manifest.entryPoints[0].main, testManifest.entryPoints[0].main);
    assert.equal(manifest.entryPoints[0].permissions, testManifest.entryPoints[0].permissions);
    assert.equal(manifest.entryPoints[0].label, testManifest.entryPoints[0].label);
    assert.equal(manifest.entryPoints[0].defaultSize, testManifest.entryPoints[0].defaultSize);
    assert.equal(manifest.entryPoints[0].entrypointProperties, testManifest.entryPoints[0]);
    assert.equal(manifest.entryPoints[0].discoverable, testManifest.entryPoints[0].discoverable);
    assert.equal(manifest.entryPoints[0].hostDomain, testManifest.entryPoints[0].hostDomain);

    assert.equal(manifest.requirements.experimentalApis, testManifest.requirements.experimentalApis);
    assert.equal(manifest.requirements._blessedPartnerAccess, testManifest.requirements._blessedPartnerAccess);
    assert.equal(manifest.requirements.trustedPartnerApis, testManifest.requirements.trustedPartnerApis);
    if (manifest.requirements.trustedPartnerApis) {
        assert.equal(
            manifest.requirements.trustedPartnerApis.messaging,
            testManifest.requirements.trustedPartnerApis.messaging
        );
        assert.equal(
            manifest.requirements.trustedPartnerApis.expressPrint,
            testManifest.requirements.trustedPartnerApis.expressPrint
        );
        assert.equal(
            manifest.requirements.trustedPartnerApis.toastNotifications,
            testManifest.requirements.trustedPartnerApis.toastNotifications
        );
        assert.equal(
            manifest.requirements.trustedPartnerApis.addOnLifecycle,
            testManifest.requirements.trustedPartnerApis.addOnLifecycle
        );
        assert.equal(
            manifest.requirements.trustedPartnerApis.tiktokcml,
            testManifest.requirements.trustedPartnerApis.tiktokcml
        );
        assert.equal(
            manifest.requirements.trustedPartnerApis.formSubmission,
            testManifest.requirements.trustedPartnerApis.formSubmission
        );
    }
}
