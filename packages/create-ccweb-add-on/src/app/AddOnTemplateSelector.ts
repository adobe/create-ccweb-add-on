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

import type { AnalyticsService } from "@adobe/ccweb-add-on-analytics";
import { ITypes as IAnalyticsTypes } from "@adobe/ccweb-add-on-analytics";
import type { Logger } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes, isNullOrWhiteSpace } from "@adobe/ccweb-add-on-core";
import { EntrypointType } from "@adobe/ccweb-add-on-manifest";
import chalk from "chalk";
import { inject, injectable } from "inversify";
import prompts from "prompts";
import "reflect-metadata";
import format from "string-template";
import { AnalyticsErrorMarkers } from "../AnalyticsMarkers.js";
import { ADD_ON_TEMPLATES, AVAILABLE_ADD_ON_TEMPLATES, PROGRAM_NAME, WITH_DOCUMENT_SANDBOX } from "../constants.js";
import type { CLIOptions } from "../models/index.js";
import type { TemplateSelector } from "./TemplateSelector.js";

@injectable()
export class AddOnTemplateSelector implements TemplateSelector {
    private readonly _logger: Logger;
    private readonly _analyticsService: AnalyticsService;

    /**
     * Instantiate {@link AddOnTemplateSelector}.
     * @param logger - {@link Logger} reference.
     * @param analyticsService - {@link AnalyticsService} reference.
     * @returns Reference to a new {@link AddOnTemplateSelector} instance.
     */
    constructor(
        @inject(ICoreTypes.Logger) logger: Logger,
        @inject(IAnalyticsTypes.AnalyticsService) analyticsService: AnalyticsService
    ) {
        this._logger = logger;
        this._analyticsService = analyticsService;
    }

    /**
     * Sets up a template, as selected/provided by the user
     * for scaffolding the add-on project.
     * @param options - {@link CLIOptions}.
     * @returns User selected/provided template name.
     */
    async setupTemplate(options: CLIOptions): Promise<string> {
        await this._validateAddOnKind(options.addOnKind);

        if (!isNullOrWhiteSpace(options.templateName)) {
            if (AVAILABLE_ADD_ON_TEMPLATES.includes(options.templateName)) {
                return options.templateName;
            } else {
                this._logger.warning(LOGS.chooseValidTemplate, { prefix: LOGS.newLine });
            }
        }

        // Add a line break for better log readability.
        console.log();

        const templateChoices = [];
        for (const [templateName, description] of ADD_ON_TEMPLATES.entries()) {
            templateChoices.push({
                title: this._promptMessageOption(templateName, description),
                value: templateName
            });
        }

        const templateResponse = await prompts.prompt({
            type: "select",
            name: "selectedTemplate",
            message: this._promptMessage(LOGS.setupTemplate),
            choices: templateChoices,
            initial: 0
        });

        if (!templateResponse || !templateResponse.selectedTemplate) {
            console.log();
            return process.exit(0);
        }

        /* c8 ignore next 4 */
        /* All templates are currently available. */
        if (!AVAILABLE_ADD_ON_TEMPLATES.includes(`${templateResponse.selectedTemplate}-${WITH_DOCUMENT_SANDBOX}`)) {
            return templateResponse.selectedTemplate;
        }

        const documentSandboxChoices = [
            {
                title: this._promptMessageOption(LOGS.no),
                value: false
            },
            {
                title: this._promptMessageOption(LOGS.yes),
                value: true
            }
        ];
        const documentSandboxResponse = await prompts.prompt({
            type: "select",
            name: "includeDocumentSandbox",
            message: this._promptMessage(LOGS.includeDocumentSandbox),
            choices: documentSandboxChoices,
            initial: 0
        });

        if (!documentSandboxResponse || documentSandboxResponse.includeDocumentSandbox === undefined) {
            console.log();
            return process.exit(0);
        }

        // Append `with-document-sandbox` to the template name if user wants to include document sandbox
        return documentSandboxResponse.includeDocumentSandbox
            ? `${templateResponse.selectedTemplate}-${WITH_DOCUMENT_SANDBOX}`
            : templateResponse.selectedTemplate;
    }

    private _promptMessage(message: string): string {
        return chalk.cyan(message);
    }

    private _promptMessageOption(option: string, description?: string): string {
        if (description) {
            return `${chalk.hex("#E59400").bold(`[${option}]:`)} ${chalk.green(description)}`;
        }
        return chalk.green.bold(option);
    }

    /**
     * Validate whether addOnKind is valid or not.
     * @param addOnKind - Kind of Add-on. For example: panel.
     */
    private async _validateAddOnKind(addOnKind: EntrypointType): Promise<void> {
        if (addOnKind !== EntrypointType.PANEL) {
            this._logger.warning(LOGS.chooseValidKind);
            this._logger.warning(
                format(LOGS.executeProgramWithValidKind, {
                    PROGRAM_NAME
                }),
                {
                    prefix: LOGS.tab
                }
            );
            this._logger.message(LOGS.forExample, { prefix: LOGS.newLine });
            this._logger.information(
                format(LOGS.executeProgramWithValidKindExample, {
                    PROGRAM_NAME
                }),
                {
                    prefix: LOGS.tab
                }
            );

            await this._analyticsService.postEvent(
                AnalyticsErrorMarkers.ERROR_INVALID_KIND,
                LOGS.analyticsInvalidKind,
                false
            );
            return process.exit(0);
        }
    }
}
const LOGS = {
    newLine: "\n",
    tab: "  ",
    setupTemplate: "Please select a template which you want to scaffold the Add-on project with",
    chooseValidKind: "Please choose a valid Add-on kind (valid kind: panel)",
    executeProgramWithValidKind: "{PROGRAM_NAME} <add-on-name> --kind <panel>",
    executeProgramWithValidKindExample: "{PROGRAM_NAME} my-add-on --kind panel",
    chooseValidTemplate: "You have chosen an invalid template.",
    forExample: "For example:",
    analyticsInvalidKind: "Invalid Add-on kind specified",
    includeDocumentSandbox: "Do you want to include document sandbox runtime?",
    yes: "Yes",
    no: "No"
};
