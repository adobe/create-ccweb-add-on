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

import {
    AuthorInfoSchema,
    EntrypointSchemaV1,
    EntrypointSchemaV2,
    IconSchema,
    LabelSchema,
    RequirementSchemaV1,
    RequirementSchemaV2
} from "./AddOnManifestSchemaTypes.js";

/**
 *  Specifies the Add-On manifest schema. Schema definition and more details are present here:
 *  https://wiki.corp.adobe.com/display/WXP/Add-in+Manifest+and+Structure
 */

export const manifestSchemaV1 = {
    $id: "#/definitions/manifestSchemaV1",
    type: "object",
    properties: {
        id: { type: "string" },
        name: { anyOf: [{ type: "string" }, LabelSchema] },
        version: { type: "string" },
        manifestVersion: { type: "number" },
        requirements: RequirementSchemaV1,
        icon: {
            anyOf: [IconSchema, { type: "array", items: IconSchema }]
        },
        entryPoints: { type: "array", items: EntrypointSchemaV1 },
        authorInfo: AuthorInfoSchema
    },
    required: ["id", "name", "version", "manifestVersion", "requirements", "icon", "entryPoints"],
    additionalProperties: false
};

export const manifestSchemaV2 = {
    $id: "#/definitions/manifestSchemaV2",
    type: "object",
    properties: {
        testId: { type: "string" },
        name: { type: "string", pattern: "^[a-zA-Z0-9]+[a-zA-Z0-9 ]{2,44}$" },
        version: { type: "string", pattern: "^[0-9]+.[0-9]+.[0-9]+$" },
        manifestVersion: { type: "number" },
        requirements: RequirementSchemaV2,
        entryPoints: { type: "array", items: EntrypointSchemaV2 }
    },
    required: ["version", "manifestVersion", "requirements", "entryPoints"],
    additionalProperties: true
};

export const manifestSchemaDeveloperV1 = {
    $id: "#/definitions/manifestSchemaDeveloperV1",
    type: "object",
    properties: {
        id: { type: "string" },
        name: { anyOf: [{ type: "string" }, LabelSchema] },
        version: { type: "string" },
        manifestVersion: { type: "number" },
        requirements: RequirementSchemaV1,
        icon: {
            anyOf: [IconSchema, { type: "array", items: IconSchema }]
        },
        entryPoints: { type: "array", items: EntrypointSchemaV1 },
        externalURL: { type: "string" },
        authorInfo: AuthorInfoSchema
    },
    required: ["id", "entryPoints"],
    additionalProperties: true
};

export const manifestSchemaDeveloperV2 = manifestSchemaV2;
