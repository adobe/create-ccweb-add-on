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
 * This script generates standalone validation function from the manifest JSON schemas
 * at compile/build time. More details on why this is preferred and used is documented
 * here: https://ajv.js.org/standalone.html
 *
 * It generates a file `validateManifestSchema.mjs` at src/generated with the validation function
 */

import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";
import { manifestSchemaDeveloperV1, manifestSchemaV1, manifestSchemaV2 } from "./AddOnManifestSchema.js";
/* eslint-disable no-restricted-imports -- importing standalone from ajv */
import standaloneCode from "ajv/dist/standalone/index.js";

// Add manifests with different versions here
const schemas = {
    validateSchemaV1: manifestSchemaV1["$id"],
    validateSchemaDeveloperV1: manifestSchemaDeveloperV1["$id"],
    validateSchemaV2: manifestSchemaV2["$id"]
};

const __dirname = path.resolve();
const ajv = new Ajv({
    schemas: [manifestSchemaV1, manifestSchemaV2, manifestSchemaDeveloperV1],
    code: { source: true, esm: true }
});
const moduleCode = standaloneCode(ajv, schemas);

var dir = path.join(__dirname, "src/generated");
try {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(dir, "validateManifestSchema.mjs"), moduleCode);
} catch (err) {
    console.error("Failed to generate manifest schema validators: ", err);
}
