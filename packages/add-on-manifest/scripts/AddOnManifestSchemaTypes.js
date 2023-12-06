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

const typePattern = "^(panel)$";
const sandboxPattern = "^(allow-popups|allow-presentation|allow-downloads|allow-popups-to-escape-sandbox)$";
const clipboardPattern = "^(clipboard-write|clipboard-read)$";
const iconPattern = "^(lightest|light|medium|dark|darkest|all)$";
const appPattern = "^(Express)$";
const deviceClassPattern = "^(desktop|mobile|app)$";

export const IconSchema = {
    type: "object",
    properties: {
        width: { type: "number" },
        height: { type: "number" },
        href: { type: "string" },
        theme: { type: "array", items: { type: "string", pattern: iconPattern } },
        scale: { type: "array", items: { type: "number" } }
    },
    required: ["href", "theme"],
    additionalProperties: false
};

export const LabelSchema = {
    type: "object",
    properties: {
        default: { type: "string" }
    },
    required: ["default"],
    additionalProperties: true
};

export const AuthorInfoSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        email: { type: "string" },
        url: { type: "string" }
    },
    required: ["name", "email"],
    additionalProperties: false
};

export const EntrypointSchemaV1 = {
    type: "object",
    properties: {
        type: { type: "string", pattern: typePattern },
        id: { type: "string" },
        main: { type: "string" },
        label: { anyOf: [{ type: "string" }, LabelSchema] },
        permissions: {
            type: "object",
            properties: {
                sandbox: { type: "array", items: { type: "string", pattern: sandboxPattern } },
                oauth: { type: "array", items: { type: "string" } },
                microphone: { type: "string" },
                camera: { type: "string" }
            },
            required: [],
            additionalProperties: false
        },
        defaultSize: {
            type: "object",
            properties: {
                width: { type: "number" },
                height: { type: "number" }
            },
            required: ["width", "height"],
            additionalProperties: false
        }
    },
    required: ["type", "id", "label", "main"],
    additionalProperties: false
};

export const EntrypointSchemaV2 = {
    type: "object",
    properties: {
        type: { type: "string", pattern: typePattern },
        id: { type: "string" },
        main: { type: "string" },
        script: { type: "string" },
        documentSandbox: { type: "string" },
        permissions: {
            type: "object",
            properties: {
                sandbox: { type: "array", items: { type: "string", pattern: sandboxPattern } },
                oauth: { type: "array", items: { type: "string" } },
                microphone: { type: "string" },
                camera: { type: "string" },
                analytics: { type: "boolean" },
                clipboard: { type: "array", items: { type: "string", pattern: clipboardPattern } }
            },
            required: [],
            additionalProperties: false
        },
        discoverable: { type: "boolean" }
    },
    required: ["type", "id", "main"],
    additionalProperties: false
};

export const RequirementSchemaV1 = {
    type: "object",
    properties: {
        apps: { type: "array", items: { type: "string", pattern: appPattern } },
        experimentalApis: { type: "boolean" }
    },
    required: ["apps"],
    additionalProperties: false
};

const AppSchema = {
    type: "object",
    properties: {
        name: { type: "string", pattern: appPattern },
        apiVersion: { type: "number" },
        supportedDeviceClass: { type: "array", items: { type: "string", pattern: deviceClassPattern } }
    },
    required: ["name", "apiVersion"],
    additionalProperties: false
};

export const RequirementSchemaV2 = {
    type: "object",
    properties: {
        apps: { type: "array", items: AppSchema },
        experimentalApis: { type: "boolean" },
        supportsTouch: { type: "boolean" },
        renditionPreview: { type: "boolean" },
        privilegedApis: { type: "boolean" },
        _blessedPartnerAccess: { type: "string" },
        trustedPartnerApis: {
            type: "object",
            properties: {
                messaging: { type: "boolean" }
            }
        }
    },
    required: ["apps"],
    additionalProperties: false
};
