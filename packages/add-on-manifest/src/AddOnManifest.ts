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

import type {
    AddOnInfo,
    AddOnLogAction,
    AddOnLogLevel,
    AuthorInfo,
    EntrypointV1,
    EntrypointV2,
    IconType,
    LocalisedStrings,
    ManifestValidationResult,
    RequirementsV1,
    RequirementsV2
} from "./AddOnManifestTypes.js";
import { AddOnManifestValidator } from "./AddOnManifestValidator.js";
import { AddOnManifestEntrypoint } from "./manifest-field/AddOnManifestEntrypoint.js";
import { AddOnManifestRequirement } from "./manifest-field/AddOnManifestRequirement.js";

/**
 *  Specifies the metadata and configuration information for Add-Ons
 *  More details on the schema and fields are present here:
 *  https://wiki.corp.adobe.com/display/WXP/Add-in+Manifest+and+Structure
 */

// [WXP-680] TODO: Add docs for the Manifest schema
export type AddOnManifestV1 = {
    readonly id: string;
    readonly name: string | LocalisedStrings;
    readonly version: string;
    readonly manifestVersion: number;
    readonly requirements: RequirementsV1;
    readonly icon: IconType | readonly IconType[];
    readonly entryPoints: readonly EntrypointV1[];
    readonly authorInfo?: AuthorInfo;
};

export type AddOnManifestV2 = {
    readonly testId?: string;
    readonly name?: string;
    readonly version: string;
    readonly manifestVersion: number;
    readonly requirements: RequirementsV2;
    readonly entryPoints: readonly EntrypointV2[];
};

export enum ManifestVersion {
    V1 = 1,
    V2 = 2
}

interface AddOnManifestTypeMap {
    [ManifestVersion.V1]: AddOnManifestV1;
    [ManifestVersion.V2]: AddOnManifestV2;
}
type Manifest = AddOnManifestV1 | AddOnManifestV2;

export type AddOnManifestType<T extends ManifestVersion> = AddOnManifestTypeMap[T];

export type CreateManifestResult = {
    manifestValidationResult: ManifestValidationResult;
    manifest?: AddOnManifest;
};

/**
 * Defines the getter methods for AddOn manifest fields
 */
export class AddOnManifest {
    private _requirement: AddOnManifestRequirement | undefined;
    private _entrypoints: AddOnManifestEntrypoint[] = [];
    private readonly _manifest: Manifest;

    static createManifest(
        addOnInfo: AddOnInfo,
        addOnLogger?: Map<AddOnLogLevel, AddOnLogAction>
    ): CreateManifestResult {
        // validate the manifest here and if rejected return
        const manifestValidator = new AddOnManifestValidator(addOnLogger);
        const schemaValidation = manifestValidator.validateManifestSchema(addOnInfo.manifest, addOnInfo.additionalInfo);
        let manifestValidationResult: ManifestValidationResult = { success: true };
        if (!schemaValidation.success) {
            manifestValidationResult = {
                success: false,
                errorDetails: schemaValidation.errorDetails,
                warningDetails: schemaValidation.warningDetails
            };
            return { manifestValidationResult };
        }

        return {
            manifestValidationResult,
            manifest: new AddOnManifest({ ...addOnInfo.manifest })
        };
    }

    /**
     * TODO: [WXP-1583] Updated the response type in [AddOnInfoApi.manifest] and remove the getter
     */
    get manifestProperties(): Record<string, unknown> {
        return this._manifest;
    }

    private constructor(manifest: ReturnType<typeof JSON.parse>) {
        const manifestVersion = manifest.manifestVersion;
        switch (manifestVersion) {
            case ManifestVersion.V1: {
                this._manifest = manifest as AddOnManifestType<ManifestVersion.V1>;
                break;
            }
            default: {
                this._manifest = manifest as AddOnManifestType<ManifestVersion.V2>;
            }
        }
    }

    get id(): Readonly<string> {
        switch (this._manifest.manifestVersion) {
            case ManifestVersion.V1: {
                const { id } = this._manifest as AddOnManifestType<ManifestVersion.V1>;
                return id;
            }
            default: {
                return "";
            }
        }
    }

    get name(): Readonly<string | LocalisedStrings | undefined> {
        switch (this._manifest.manifestVersion) {
            case ManifestVersion.V1: {
                const { name } = this._manifest as AddOnManifestType<ManifestVersion.V1>;
                return name;
            }
            case ManifestVersion.V2: {
                const { name } = this._manifest as AddOnManifestType<ManifestVersion.V2>;
                return name;
            }
            default: {
                return undefined;
            }
        }
    }

    get version(): Readonly<string> {
        return this._manifest.version;
    }

    get manifestVersion(): Readonly<ManifestVersion> {
        return this._manifest.manifestVersion || ManifestVersion.V1;
    }

    get requirements(): Readonly<AddOnManifestRequirement> {
        if (!this._requirement) {
            this._requirement = new AddOnManifestRequirement(
                this._manifest.manifestVersion,
                this._manifest.requirements
            );
        }
        return this._requirement;
    }

    get icon(): Readonly<IconType | IconType[] | undefined> {
        switch (this._manifest.manifestVersion) {
            case ManifestVersion.V1: {
                const { icon } = this._manifest as AddOnManifestType<ManifestVersion.V1>;
                return icon;
            }
            default: {
                return undefined;
            }
        }
    }

    get entryPoints(): readonly AddOnManifestEntrypoint[] {
        if (!this._entrypoints.length) {
            this._manifest.entryPoints.forEach(entrypoint => {
                this._entrypoints.push(new AddOnManifestEntrypoint(this._manifest.manifestVersion, entrypoint));
            });
        }
        return this._entrypoints;
    }

    get authorInfo(): Readonly<AuthorInfo | undefined> {
        switch (this._manifest.manifestVersion) {
            case ManifestVersion.V1: {
                const { authorInfo } = this._manifest as AddOnManifestType<ManifestVersion.V1>;
                return authorInfo;
            }
            default: {
                return undefined;
            }
        }
    }
}
