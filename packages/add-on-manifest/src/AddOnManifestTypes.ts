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
 *  More details on the schema here and the fiels are present here:
 *  https://wiki.corp.adobe.com/display/WXP/Add-in+Manifest+and+Structure
 */

export type RequirementsV1 = {
    readonly apps: string[];
    readonly experimentalApis?: boolean;
};

export type App = {
    readonly name: string;
    readonly apiVersion: number;
    readonly supportedDeviceClass?: string[];
};

export type TrustedPartnerApis = {
    readonly messaging?: boolean;
    readonly expressPrint?: boolean;
    readonly addOnLifecycle?: boolean;
    readonly toastNotifications?: boolean;
    readonly tiktokcml?: boolean;
    readonly formSubmission?: boolean;
};

export type RequirementsV2 = {
    readonly apps: readonly App[];
    readonly experimentalApis?: boolean;
    readonly supportsTouch?: boolean;
    readonly renditionPreview?: boolean;
    readonly privilegedApis?: boolean;
    readonly _blessedPartnerAccess?: string;
    readonly trustedPartnerApis?: TrustedPartnerApis;
};

export type IconType = {
    /** * icon width */
    readonly width?: number;
    /** * icon height */
    readonly height?: number;
    /** * icon file href */
    readonly href: string;
    /** * icon theme ex. ["all","light"] */
    readonly theme?: readonly string[];
};

export type Size = {
    readonly width: number;
    readonly height: number;
};

export type Resizing = {
    readonly prefersConstrainedResize: boolean;
    readonly maxHeight?: number;
    readonly maxWidth?: number;
    readonly minHeight?: number;
    readonly minWidth?: number;
};

export type LocalisedStrings = {
    readonly default: string;
    readonly [k: string]: string;
};

export type Position = {
    readonly x: number;
    readonly y: number;
};

export type Permissions = {
    readonly sandbox?: string[];
    readonly oauth?: string[];
    readonly camera?: string;
    readonly microphone?: string;
    readonly clipboard?: string[];
};

export type Command = {
    readonly name: string;
    readonly supportedMimeTypes?: string[];
    readonly discoverable?: boolean;
};

export type EntrypointV1 = {
    readonly type: string;
    readonly id: string;
    readonly label: string | LocalisedStrings;
    readonly permissions?: Permissions;
    readonly defaultSize?: Size;
    readonly main: string;
};

export type EntrypointV2 = Omit<EntrypointV1, "label"> & {
    /**
     * @deprecated Use `documentSandbox` instead.
     */
    readonly script?: string;
    readonly documentSandbox?: string;
    readonly discoverable?: boolean;
    readonly hostDomain?: string;
};

export type CommandEntrypoint = EntrypointV2 & {
    readonly commands: Command[];
};

export type ManifestEntrypoint = EntrypointV1 | EntrypointV2 | CommandEntrypoint;
export type ManifestRequirements = RequirementsV1 | RequirementsV2;

/**
 * Note: This enum expects values wrt manifest permission properties to support iframe allow permissions.
 */
export enum Allow {
    camera = "camera",
    microphone = "microphone",
    clipboard = "clipboard"
}

export enum EntrypointType {
    WIDGET = "widget",
    COMMAND = "command",
    PANEL = "panel",
    SHARE = "share",
    CONTENT_HUB = "content-hub",
    MOBILE_MEDIA_AUDIO = "mobile.media.audio",
    MOBILE_YOUR_STUFF_FILES = "mobile.your-stuff.files",
    MOBILE_MORE = "mobile.more",
    SCHEDULE = "schedule",
    CONTEXTUAL_REPLACE = "contextual.replace",
    CONTEXTUAL_UPLOAD = "contextual.upload",
    CONTEXTUAL_BULK_CREATE = "contextual.bulk-create"
}

export type AuthorInfo = {
    /** Author name */
    readonly name: string;
    /** Author email address */
    readonly email: string;
    /** Author profile url */
    readonly url?: string;
};

/**
 * instancePath: JSON Pointer to the location in the data instance (e.g., `"/prop/1/subProp"`).
 * keyword: Validation keyword.
 * params: Params property is the object with the additional information about error
 * message: Error message for the failure
 */
export type ManifestError = {
    instancePath?: string;
    keyword?: string;
    params?: unknown;
    message?: string;
};

type ManifestErrorType = {
    [key: string]: ManifestError;
};

/**
 * Defines the Error Type other than avj libray validations for the Manifest
 */
export const OTHER_MANIFEST_ERRORS: ManifestErrorType = {
    ManifestVersionType: {
        instancePath: "/manifestVersion",
        message: "Manifest version should be a number"
    },
    InvalidManifestVersion: {
        instancePath: "/manifestVersion",
        message: "Invalid manifest version"
    },
    EmptyEntrypoint: {
        instancePath: "/entryPoints",
        message: "At least one entrypoint should be defined"
    },
    EmptyIcon: {
        instancePath: "/icon",
        message: "At least one icon should be defined"
    },
    TestIdRequired: {
        instancePath: "/testId",
        message: "testId should be defined in manifest for developer workflow"
    },
    InvalidClipboardPermission: {
        instancePath: "/entryPoints/permissions/clipboard",
        message: "Clipboard read permission is not allowed for this AddOn"
    },
    RestrictedPrivilegedApis: {
        instancePath: "/requirements/privilegedApis",
        message: "Privileged apis are not allowed for this add-on"
    },
    AdditionPropertyExperimentalApis: {
        instancePath: "/requirements/experimentalApis",
        message: "Experimental apis are not supported for production add-ons"
    },
    DocumentSandboxWithScript: {
        instancePath: "/entryPoints/documentSandbox",
        message: "Manifest entrypoint should have either 'documentSandbox' or 'script', not both"
    },
    InvalidHostDomain: {
        instancePath: "/entryPoints/hostDomain",
        message: "Manifest entrypoint should have valid hostDomain"
    },
    RestrictedContentHubEntrypoint: {
        instancePath: "/entryPoints/type",
        message: "Entrypoint type 'content-hub' is allowed only for privileged add-ons"
    },
    RestrictedFormsSandboxProperty: {
        instancePath: "/entryPoints/permissions/sandbox",
        message: `Sandbox property "allow-forms" is not allowed for this AddOn`
    }
};

/**
 * success: check if AddOn has been registered successfully or not.
 * errorDetails: contains all error logs from validation
 * warningDetails: contains all warning logs from validation
 */
export type ManifestValidationResult = {
    success: boolean;
    errorDetails?: ManifestError[];
    warningDetails?: ManifestError[];
};

export interface AdditionalAddOnInfo {
    sourceId: string;
    privileged: boolean;
    isDeveloperAddOn: boolean;
    id?: string;
    name?: string;
    icon?: IconType[];
    visibility?: string;
}

export interface AddOnInfo {
    manifest: ReturnType<typeof JSON.parse>;
    additionalInfo: AdditionalAddOnInfo;
}

export enum AddOnLogLevel {
    information = "information",
    warning = "warning",
    error = "error"
}

export type AddOnLogAction = (...args: unknown[]) => unknown;

export function isIframeEntryPointType(entryPointType: EntrypointType): boolean {
    return entryPointType !== EntrypointType.COMMAND;
}
