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

import type { Logger, PackageJson, TemplateJson } from "@adobe/ccweb-add-on-core";
import { IContainer as ICoreContainer, ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import type { Container, interfaces } from "inversify";
import "reflect-metadata";
import { AddOnBuilder } from "../app/AddOnBuilder.js";
import { AddOnScaffolder } from "../app/AddOnScaffolder.js";
import { PackageBuilder } from "../app/PackageBuilder.js";
import type { ScaffolderOptions } from "../models/ScaffolderOptions.js";
import { TemplateValidator } from "../validators/TemplateValidator.js";
import { ITypes } from "./inversify.types.js";

const container: Container = ICoreContainer;

container
    .bind<interfaces.Factory<AddOnBuilder>>(ITypes.AddOnBuilder)
    .toFactory<AddOnBuilder, [ScaffolderOptions]>(context => {
        return (options: ScaffolderOptions) => {
            return new AddOnBuilder(options, context.container.get<Logger>(ICoreTypes.Logger));
        };
    });

container
    .bind<interfaces.Factory<PackageBuilder>>(ITypes.PackageBuilder)
    .toFactory<PackageBuilder, [PackageJson], [TemplateJson]>(() => {
        return (packageJson: PackageJson) => (templateJson: TemplateJson) => {
            return new PackageBuilder(packageJson, templateJson);
        };
    });

container.bind<AddOnScaffolder>(ITypes.AddOnScaffolder).to(AddOnScaffolder).inSingletonScope();

container.bind<TemplateValidator>(ITypes.TemplateValidator).to(TemplateValidator).inSingletonScope();

export { container as IContainer };
