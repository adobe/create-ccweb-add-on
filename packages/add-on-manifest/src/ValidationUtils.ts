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

import type { ErrorObject, ValidateFunction } from "ajv";
import { ManifestVersion } from "./AddOnManifest.js";
import type { AddOnLogAction, ManifestError, ManifestValidationResult } from "./AddOnManifestTypes.js";
import { AddOnLogLevel } from "./AddOnManifestTypes.js";
import { validateSchemaDeveloperV1, validateSchemaV2 } from "./generated/validateManifestSchema.mjs";

// Add schema validators to the following list ordered by version numbers
const developerValidatorVersions = [validateSchemaDeveloperV1, validateSchemaV2];

function getErrors(
    validateSchema: unknown,
    addOnLogger: Map<AddOnLogLevel, AddOnLogAction> | undefined
): ManifestValidationResult {
    const manifestErrors = (validateSchema as ValidateFunction).errors;
    const logError = addOnLogger?.get(AddOnLogLevel.error);
    if (logError !== undefined) {
        logError(manifestErrors);
    }
    const validationErrors = getValidationErrors(manifestErrors);
    return { success: false, errorDetails: validationErrors };
}

export function developerVersionValidation(
    manifest: ReturnType<typeof JSON.parse>,
    addOnLogger: Map<AddOnLogLevel, AddOnLogAction> | undefined
): ManifestValidationResult {
    const manifestVersion = manifest.manifestVersion || ManifestVersion.V1;
    const schemaValidator = developerValidatorVersions[manifestVersion - 1];
    if (!schemaValidator(manifest)) {
        return getErrors(schemaValidator, addOnLogger);
    }
    return { success: true };
}

export function getValidationErrors(validationErrors: ErrorObject[] | undefined | null): ManifestError[] {
    const errors: ManifestError[] = [];
    validationErrors?.forEach(i => {
        errors.push({ instancePath: i.instancePath, keyword: i.keyword, params: i.params, message: i.message });
    });
    return errors;
}

export function getManifestVersion(manifest: ReturnType<typeof JSON.parse>, isDeveloperAddOn: boolean): number {
    if (isDeveloperAddOn) {
        return manifest.manifestVersion ?? ManifestVersion.V1;
    }
    return manifest.manifestVersion;
}
