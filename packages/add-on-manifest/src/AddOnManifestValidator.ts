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

import type { ValidateFunction } from "ajv";
import { ManifestVersion } from "./AddOnManifest.js";
import {
    AddOnLogAction,
    AddOnLogLevel,
    AdditionalAddOnInfo,
    ManifestError,
    ManifestValidationResult,
    OTHER_MANIFEST_ERRORS,
    ManifestEntrypoint,
    EntrypointV2,
    EntrypointType
} from "./AddOnManifestTypes.js";
import { developerVersionValidation, getManifestVersion, getValidationErrors } from "./ValidationUtils.js";
import { validateSchemaV1, validateSchemaV2 } from "./generated/validateManifestSchema.mjs";

// Add schema validators to the following list ordered by version numbers
const validatorVersions = [validateSchemaV1, validateSchemaV2];

export class AddOnManifestValidator {
    private readonly _logError: AddOnLogAction;
    private readonly _logWarn: AddOnLogAction;
    private _manifestVersion!: number;

    constructor(private readonly _addOnLogger?: Map<AddOnLogLevel, AddOnLogAction>) {
        this._logError =
            this._addOnLogger?.get(AddOnLogLevel.error) ??
            (() => {
                return;
            });
        this._logWarn =
            this._addOnLogger?.get(AddOnLogLevel.warning) ??
            (() => {
                return;
            });
    }

    private _commonAdditionalValidations(
        manifest: ReturnType<typeof JSON.parse>,
        additionalInfo: AdditionalAddOnInfo
    ): ManifestValidationResult {
        let isValidSchema = true;
        const validationErrors: ManifestError[] = [];
        if (!manifest.entryPoints?.length) {
            this._logError("At least one entrypoint should be defined");
            isValidSchema = false;
            validationErrors.push(OTHER_MANIFEST_ERRORS.EmptyEntrypoint);
        }

        manifest.entryPoints?.forEach((entryPoint: ManifestEntrypoint) => {
            if (entryPoint.type === EntrypointType.CONTENT_HUB && !manifest.requirements?.privilegedApis) {
                this._logError("Entrypoint type 'content-hub' is allowed only for privileged add-ons");
                isValidSchema = false;
                validationErrors.push(OTHER_MANIFEST_ERRORS.RestrictedContentHubEntrypoint);
            }
        });

        if (!additionalInfo.privileged) {
            if (manifest.requirements?.privilegedApis) {
                this._logError("Privileged apis are not allowed for this add-on");
                isValidSchema = false;
                validationErrors.push(OTHER_MANIFEST_ERRORS.RestrictedPrivilegedApis);
            }
            manifest.entryPoints?.forEach((entrypoint: ManifestEntrypoint) => {
                const canReadClipboard =
                    entrypoint.permissions?.clipboard?.find(c => c === "clipboard-read") !== undefined;
                if (canReadClipboard) {
                    this._logError(
                        "Clipboard-read permission is not allowed for the Add-on entrypoint: ",
                        entrypoint.id
                    );
                    validationErrors.push(OTHER_MANIFEST_ERRORS.InvalidClipboardPermission);
                    isValidSchema = false;
                }
            });
        }
        if (this._manifestVersion > ManifestVersion.V1) {
            const entryPointsValidation = this._isValidEntryPoint(manifest);
            if (!entryPointsValidation.success) {
                isValidSchema = false;
                validationErrors.push(...entryPointsValidation.errorDetails!);
            }
        }
        return {
            success: isValidSchema,
            errorDetails: validationErrors
        };
    }

    private _isValidEntryPoint(manifest: ReturnType<typeof JSON.parse>): ManifestValidationResult {
        let isValidSchema = true;
        const validationErrors: ManifestError[] = [];
        manifest.entryPoints?.forEach((entrypoint: EntrypointV2) => {
            if (entrypoint.documentSandbox && entrypoint.script) {
                this._logError(
                    `Manifest entrypoint '${entrypoint.id}' should have either 'documentSandbox' or 'script', not both`
                );
                validationErrors.push(OTHER_MANIFEST_ERRORS.DocumentSandboxWithScript);
                isValidSchema = false;
            }
            if (
                entrypoint.hostDomain !== undefined &&
                !entrypoint.hostDomain.match(new RegExp("https://[a-zA-Z0-9-.]{3,}.[a-zA-Z]{2,}(.[a-zA-Z]{2,})?"))
            ) {
                this._logError(`Manifest entrypoint '${entrypoint.id}' should have valid host domain`);
                validationErrors.push(OTHER_MANIFEST_ERRORS.InvalidHostDomain);
                isValidSchema = false;
            }
        });
        return {
            success: isValidSchema,
            errorDetails: validationErrors
        };
    }

    private _verifyAdditionalDeveloperValidations(
        manifest: ReturnType<typeof JSON.parse>,
        additionalInfo: AdditionalAddOnInfo
    ): Required<ManifestValidationResult> {
        const manifestVersion = manifest.manifestVersion || ManifestVersion.V1;
        let isValidSchema = true;
        const validationErrors: ManifestError[] = [];
        const validationWarnings: ManifestError[] = [];
        const commonValidations = this._commonAdditionalValidations(manifest, additionalInfo);
        if (!commonValidations.success) {
            isValidSchema = false;
            validationErrors.push(...commonValidations.errorDetails!);
        }

        switch (manifestVersion) {
            case ManifestVersion.V1: {
                if (Array.isArray(manifest?.icon) && !manifest.icon?.length) {
                    this._logWarn("At least one icon should be defined");
                    validationWarnings.push(OTHER_MANIFEST_ERRORS.EmptyIcon);
                }
                break;
            }
            default: {
                if (!manifest.testId) {
                    this._logError("testId should be defined in manifest for developer workflow");
                    isValidSchema = false;
                    validationErrors.push(OTHER_MANIFEST_ERRORS.TestIdRequired);
                }
            }
        }
        return {
            success: isValidSchema,
            errorDetails: validationErrors,
            warningDetails: validationWarnings
        };
    }

    validateDeveloperSchema(
        manifest: ReturnType<typeof JSON.parse>,
        additionalInfo: AdditionalAddOnInfo
    ): ManifestValidationResult {
        const validationErrors: ManifestError[] = [];
        const validationWarnings: ManifestError[] = [];
        const schemaValidation = developerVersionValidation(manifest, this._addOnLogger);
        if (!schemaValidation.success) {
            this._logError(`Errors in Manifest.json to fix before submission: ${schemaValidation.errorDetails}`);
            validationErrors.push(...schemaValidation.errorDetails!);
        }
        const additionValidations = this._verifyAdditionalDeveloperValidations(manifest, additionalInfo);
        validationWarnings.push(...additionValidations.warningDetails);
        validationErrors.push(...additionValidations.errorDetails);
        const success = schemaValidation.success && additionValidations.success;
        return {
            success,
            warningDetails: validationWarnings.length ? validationWarnings : undefined,
            errorDetails: success ? undefined : validationErrors
        };
    }

    private _verifyAdditionalValidations(
        manifest: ReturnType<typeof JSON.parse>,
        additionalInfo: AdditionalAddOnInfo
    ): ManifestValidationResult {
        let isValidSchema = true;
        const validationErrors: ManifestError[] = [];
        if (manifest.requirements.experimentalApis && !additionalInfo.isDeveloperAddOn) {
            this._logError("Experimental apis are not supported for production add-ons");
            validationErrors.push(OTHER_MANIFEST_ERRORS.AdditionPropertyExperimentalApis);
            isValidSchema = false;
        }
        const commonValidations = this._commonAdditionalValidations(manifest, additionalInfo);
        if (!commonValidations.success) {
            isValidSchema = false;
            validationErrors.push(...commonValidations.errorDetails!);
        }

        switch (this._manifestVersion) {
            case ManifestVersion.V1: {
                if (Array.isArray(manifest?.icon) && !manifest.icon?.length) {
                    this._logError("At least one icon should be defined");
                    validationErrors.push(OTHER_MANIFEST_ERRORS.EmptyIcon);
                    isValidSchema = false;
                }
                break;
            }
        }
        return {
            success: isValidSchema,
            errorDetails: validationErrors
        };
    }

    private _validateSchema(
        manifest: ReturnType<typeof JSON.parse>,
        additionalInfo: AdditionalAddOnInfo
    ): ManifestValidationResult {
        const schemaValidator = validatorVersions[this._manifestVersion - 1];
        let isValidSchema = true;
        let validationErrors: ManifestError[] = [];
        if (!schemaValidator(manifest)) {
            const manifestErrors = (schemaValidator as ValidateFunction).errors;
            this._logError(`Errors in Manifest.json to fix before submission: ${manifestErrors}`);
            validationErrors = getValidationErrors(manifestErrors);
            isValidSchema = false;
        }
        const additionalValidations = this._verifyAdditionalValidations(manifest, additionalInfo);
        if (!additionalValidations.success) {
            validationErrors.push(...additionalValidations.errorDetails!);
        }
        const success = isValidSchema && additionalValidations.success;
        return { success, errorDetails: success ? undefined : validationErrors };
    }

    validateManifestSchema(
        manifest: ReturnType<typeof JSON.parse>,
        additionalInfo: AdditionalAddOnInfo
    ): ManifestValidationResult {
        if (!manifest) {
            return { success: false };
        }
        this._manifestVersion = getManifestVersion(manifest, additionalInfo.isDeveloperAddOn);
        if (isNaN(this._manifestVersion)) {
            this._logError("Manifest version should be a number");
            return { success: false, errorDetails: [OTHER_MANIFEST_ERRORS.ManifestVersionType] };
        }
        if (this._manifestVersion <= 0) {
            this._logError(`Incorrect manifest version : ${this._manifestVersion}`);
            return { success: false, errorDetails: [OTHER_MANIFEST_ERRORS.InvalidManifestVersion] };
        }
        if (additionalInfo.isDeveloperAddOn) {
            return this.validateDeveloperSchema(manifest, additionalInfo);
        }
        return this._validateSchema(manifest, additionalInfo);
    }
}
