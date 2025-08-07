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
import type {
    Command,
    EntrypointV1,
    EntrypointV2,
    CommandEntrypoint,
    LocalisedStrings,
    ManifestEntrypoint,
    Permissions,
    Size,
    EntrypointType
} from "../AddOnManifestTypes.js";

interface ManifestEntrypointTypeMap {
    [ManifestVersion.V1]: EntrypointV1;
    [ManifestVersion.V2]: EntrypointV2 | CommandEntrypoint;
}

export type ManifestEntrypointType<T extends ManifestVersion> = ManifestEntrypointTypeMap[T];

/**
 * Defines the getter methods for Manifest Entrypoint field
 */
export class AddOnManifestEntrypoint {
    constructor(private _manifestVersion: number, private _entrypoint: ManifestEntrypoint) {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                this._entrypoint = _entrypoint as ManifestEntrypointType<ManifestVersion.V1>;
                break;
            }
            default: {
                this._entrypoint = _entrypoint as ManifestEntrypointType<ManifestVersion.V2>;
            }
        }
    }

    get type(): Readonly<EntrypointType> {
        return this._entrypoint.type as EntrypointType;
    }

    get id(): Readonly<string> {
        return this._entrypoint.id;
    }

    get label(): Readonly<string | LocalisedStrings | undefined> {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return (this._entrypoint as ManifestEntrypointType<ManifestVersion.V1>).label;
            }
            default: {
                return undefined;
            }
        }
    }

    get permissions(): Readonly<Permissions | undefined> {
        return this._entrypoint.permissions;
    }

    get defaultSize(): Readonly<Size | undefined> {
        return this._entrypoint.defaultSize;
    }

    get main(): Readonly<string> {
        return this._entrypoint.main;
    }

    get entrypointProperties(): ManifestEntrypoint {
        return this._entrypoint;
    }

    get documentSandbox(): Readonly<string> | undefined {
        switch (this._manifestVersion) {
            case ManifestVersion.V2: {
                const entrypoint = this._entrypoint as ManifestEntrypointType<ManifestVersion.V2>;
                // Support deprecated entrypoint script
                return entrypoint.documentSandbox || entrypoint.script;
            }
            default: {
                return undefined;
            }
        }
    }

    get hostDomain(): Readonly<string | undefined> {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return undefined;
            }
            default: {
                return (this._entrypoint as ManifestEntrypointType<ManifestVersion.V2>).hostDomain;
            }
        }
    }

    get discoverable(): Readonly<boolean> | undefined {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return undefined;
            }
            default: {
                return (this._entrypoint as ManifestEntrypointType<ManifestVersion.V2>).discoverable;
            }
        }
    }

    get commands(): Command[] | undefined {
        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                return undefined;
            }
            default: {
                return (this._entrypoint as ManifestEntrypointType<ManifestVersion.V2> as CommandEntrypoint)?.commands;
            }
        }
    }
}
