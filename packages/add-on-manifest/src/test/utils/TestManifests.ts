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

import { AddOnManifestV1, AddOnManifestV2 } from "../../AddOnManifest.js";
import {
    AuthorInfo,
    EntrypointType,
    IconType,
    LocalisedStrings,
    ManifestEntrypoint,
    RequirementsV1
} from "../../AddOnManifestTypes.js";

let count = 0;

/**
 *  Specifies the metadata and configuration information for Developer Add-Ons
 */
export type AddOnManifestDeveloperV1 = {
    readonly id: string;
    readonly name?: string | LocalisedStrings;
    readonly version?: string;
    readonly manifestVersion?: number;
    readonly requirements?: RequirementsV1;
    readonly icon?: IconType | readonly IconType[];
    readonly entryPoints: readonly ManifestEntrypoint[];
    readonly strings?: string | Record<string, LocalisedStrings>;
    readonly externalURL?: string;
    readonly authorInfo?: AuthorInfo;
};

/**
 *  Specifies the metadata and configuration information for Developer Add-Ons
 */
export type AddOnManifestDeveloperV2 = AddOnManifestV2;

export type AddOnManifestDeveloper = AddOnManifestDeveloperV1 | AddOnManifestDeveloperV2;

export function getTestManifest(): AddOnManifestV1 {
    const manifest = {
        name: "name",
        id: "id",
        version: "version",
        manifestVersion: 1,
        requirements: {
            apps: ["Express"]
        },
        entryPoints: [
            {
                type: EntrypointType.PANEL,
                id: "entrypointId",
                main: "index.html",
                label: {
                    default: "defaultLabel"
                },
                permissions: { sandbox: [] }
            }
        ],
        icon: [
            {
                width: 300,
                height: 300,
                href: "icon3.png",
                theme: ["light"]
            }
        ]
    };

    return manifest;
}

export function getTestManifestV1(privileged?: boolean): AddOnManifestV1 {
    count++;
    const entryPointDetails = {
        main: "index.html",
        label: {
            default: `#testId${count}`,
            "en-US": `#testId${count}`,
            "fr-FR": `#testId${count}`
        },
        permissions: privileged ? { sandbox: ["allow-downloads"] } : { sandbox: [] },
        defaultSize: { width: 100 + count, height: 100 + count }
    };
    const manifest = {
        name: `#testId${count}`,
        id: `#testId${count}`,
        version: `#testId${count}`,
        manifestVersion: 1,
        requirements: {
            apps: ["Express"],
            experimentalApis: false
        },
        entryPoints: [
            {
                type: EntrypointType.PANEL,
                id: `panel-${count}`,
                ...entryPointDetails
            },
            {
                type: EntrypointType.MOBILE_MEDIA_AUDIO,
                id: `mobile-media-audio-${count}`,
                ...entryPointDetails
            },
            {
                type: EntrypointType.MOBILE_YOUR_STUFF_FILES,
                id: `mobile-your-stuff-files-${count}`,
                ...entryPointDetails
            },
            {
                type: EntrypointType.CONTEXTUAL_REPLACE,
                id: `contextual-replace-${count}`,
                ...entryPointDetails
            },
            {
                type: EntrypointType.CONTEXTUAL_UPLOAD,
                id: `contextual-upload-${count}`,
                ...entryPointDetails
            },
            {
                type: EntrypointType.CONTEXTUAL_BULK_CREATE,
                id: `contextual-bulk-create-${count}`,
                ...entryPointDetails
            }
        ],
        icon: [
            {
                width: 100,
                height: 100,
                href: "icon.png",
                theme: ["lightest"]
            },
            {
                width: 200,
                height: 200,
                href: "icon2.png",
                theme: ["darkest"]
            },
            {
                width: 300,
                height: 300,
                href: "icon3.png",
                theme: ["light"],
                scale: [1, 1.25, 1.5]
            }
        ],
        authorInfo: {
            name: "Joe",
            email: "Joe@example.com"
        }
    };

    return manifest;
}

export function getTestManifestV2(privileged?: boolean): AddOnManifestV2 {
    const manifest = {
        version: `1.1.${count}`,
        testId: "testId-V2",
        manifestVersion: 2,
        requirements: {
            apps: [
                {
                    name: "Express",
                    apiVersion: 1,
                    supportedDeviceClass: ["desktop", "mobile-ios", "mobile-android"]
                },
                {
                    name: "Express",
                    apiVersion: 2
                }
            ],
            experimentalApis: false,
            supportsTouch: true,
            renditionPreview: true,
            privilegedApis: privileged ?? false,
            _blessedPartnerAccess: "blessedPartnerAccess",
            trustedPartnerApis: {
                messaging: false,
                expressPrint: true,
                addOnLifecycle: false,
                formSubmission: true,
                toastNotifications: false,
                tiktokcml: true
            }
        },
        entryPoints: [
            {
                type: EntrypointType.PANEL,
                id: `panel-${count}`,
                main: "index.html",
                permissions: privileged ? { sandbox: ["allow-downloads"] } : { sandbox: [] },
                defaultSize: { width: 100 + count, height: 100 + count },
                discoverable: true,
                hostDomain: "https://localhost.adobe.com"
            },
            {
                type: EntrypointType.COMMAND,
                id: "assetProvider",
                main: "command.html",
                commands: [
                    {
                        name: "assetProvider.getAssets",
                        supportedMimeTypes: ["image/jpeg", "image/png", "image/bmp"],
                        discoverable: true
                    }
                ],
                permissions: {
                    oauth: ["accounts.google.com"]
                }
            },
            {
                type: EntrypointType.MOBILE_MEDIA_AUDIO,
                id: `mobile-media-audio-${count}`,
                main: "index.html"
            },
            {
                type: EntrypointType.MOBILE_YOUR_STUFF_FILES,
                id: `mobile-your-stuff-files-${count}`,
                main: "index.html"
            },
            {
                type: EntrypointType.CONTEXTUAL_REPLACE,
                id: `contextual-replace-${count}`,
                main: "index.html"
            },
            {
                type: EntrypointType.CONTEXTUAL_UPLOAD,
                id: `contextual-upload-${count}`,
                main: "index.html"
            },
            {
                type: EntrypointType.CONTEXTUAL_BULK_CREATE,
                id: `contextual-bulk-create-${count}`,
                main: "index.html"
            }
        ]
    };
    return manifest;
}

export function getTestDeveloperManifestV1(): AddOnManifestDeveloperV1 {
    const manifest = {
        id: `#testId${count}`,
        manifestVersion: 1,
        requirements: {
            apps: ["Express"],
            experimentalApis: true
        },
        entryPoints: [
            {
                type: EntrypointType.PANEL,
                id: `#testId${count}`,
                main: "index.html",
                label: {
                    default: `#testId${count}`,
                    "en-US": `#testId${count}`,
                    "fr-FR": `#testId${count}`
                }
            }
        ]
    };

    return manifest;
}

export function getTestDeveloperManifestV2(privileged?: boolean): AddOnManifestDeveloperV2 {
    return getTestManifestV2(privileged);
}

export function getTestManifestV2WithScript(script: string | undefined = undefined): AddOnManifestV2 {
    const manifest = {
        ...getTestManifestV2(),
        entryPoints: [
            {
                type: EntrypointType.PANEL,
                id: `#testId${count}`,
                main: "index.html",
                script,
                permissions: { sandbox: [] }
            }
        ]
    };
    return manifest;
}

export function getTestManifestV2WithDocumentSandbox(documentSandbox: string | undefined = undefined): AddOnManifestV2 {
    const manifest = {
        ...getTestManifestV2(),
        entryPoints: [
            {
                type: EntrypointType.PANEL,
                id: `#testId${count}`,
                main: "index.html",
                documentSandbox,
                permissions: { sandbox: [] }
            }
        ]
    };
    return manifest;
}
