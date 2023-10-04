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

import { ManifestVersion } from "../AddOnManifest.js";
import { App, ManifestRequirements, RequirementsV1, RequirementsV2 } from "../AddOnManifestTypes.js";
import { AddOnManifestApp } from "./AddOnManifestApp.js";

interface ManifestRequirementTypeMap {
    [ManifestVersion.V1]: RequirementsV1;
    [ManifestVersion.V2]: RequirementsV2;
}

export type ManifestRequirementType<T extends ManifestVersion> = ManifestRequirementTypeMap[T];

/**
 * Defines the getter methods for Manifest Requirement field
 */
export class AddOnManifestRequirement {
    private _apps: AddOnManifestApp[] = [];

    constructor(private _manifestVersion: number, private _requirements: ManifestRequirements) {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                this._requirements = this._requirements as ManifestRequirementType<ManifestVersion.V1>;
                break;
            }
            default: {
                this._requirements = this._requirements as ManifestRequirementType<ManifestVersion.V2>;
            }
        }
    }

    // TODO: [WXP-1700] Return apps as AddOnManifestApp[] for all manifest versions
    get apps(): Readonly<string[] | AddOnManifestApp[]> {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return (this._requirements as ManifestRequirementType<ManifestVersion.V1>).apps;
            }
            default: {
                if (!this._apps.length) {
                    this._requirements.apps.forEach(app => {
                        this._apps.push(new AddOnManifestApp(app as App));
                    });
                }
                return this._apps;
            }
        }
    }

    get experimentalApis(): Readonly<boolean> {
        return Boolean(this._requirements.experimentalApis);
    }

    get supportsTouch(): Readonly<boolean> {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return false;
            }
            default: {
                return Boolean((this._requirements as ManifestRequirementType<ManifestVersion.V2>).supportsTouch);
            }
        }
    }

    get renditionPreview(): Readonly<boolean> {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return false;
            }
            default: {
                return Boolean((this._requirements as ManifestRequirementType<ManifestVersion.V2>).renditionPreview);
            }
        }
    }
    get privilegedApis(): Readonly<boolean> {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return false;
            }
            default: {
                return Boolean((this._requirements as ManifestRequirementType<ManifestVersion.V2>).privilegedApis);
            }
        }
    }
    get _blessedPartnerAccess(): Readonly<string> | undefined {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return undefined;
            }
            default: {
                return (this._requirements as ManifestRequirementType<ManifestVersion.V2>)._blessedPartnerAccess;
            }
        }
    }
}
