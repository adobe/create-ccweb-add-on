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

import type { Logger } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import { inject, injectable } from "inversify";
import process from "process";
import "reflect-metadata";
import format from "string-template";
import { PROGRAM_NAME } from "../constants.js";

/**
 * Validator class to validate user selected template..
 */
@injectable()
export class TemplateValidator {
    private readonly _logger: Logger;

    /**
     * Instantiate {@link TemplateValidator}.
     *
     * @param logger - {@link Logger} reference.
     * @returns Reference to a new {@link TemplateValidator} instance.
     */
    constructor(@inject(ICoreTypes.Logger) logger: Logger) {
        this._logger = logger;
    }

    /**
     * Validate the template.
     *
     * @param templateName - Name of the template.
     */
    validateTemplate(templateName: string): void {
        if (isNullOrWhiteSpace(templateName)) {
            this._logger.warning(LOGS.specifyValidTemplateName);
            this._logger.warning(format(LOGS.executeProgram, { PROGRAM_NAME }), {
                prefix: LOGS.tab
            });
            this._logger.message(LOGS.forExample, { prefix: LOGS.newLine });
            this._logger.information(format(LOGS.executeProgramExample, { PROGRAM_NAME }), {
                prefix: LOGS.tab
            });

            process.exit(1);
        }
    }
}

const LOGS = {
    newLine: "\n",
    tab: "  ",
    specifyValidTemplateName: "Please specify a valid template name:",
    executeProgram: "{PROGRAM_NAME} --template <template-name>",
    executeProgramExample: "{PROGRAM_NAME} --template javascript",
    forExample: "For example:"
};
