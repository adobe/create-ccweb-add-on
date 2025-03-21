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

import { IContainer as ICoreContainer } from "@adobe/ccweb-add-on-core";
import "reflect-metadata";
import type { AddOnFactory, TemplateSelector } from "../app/index.js";
import { AddOnTemplateSelector, WxpAddOnFactory } from "../app/index.js";
import type { DirectoryValidator, EnvironmentValidator } from "../validators/index.js";
import { AddOnDirectoryValidator, NodeEnvironmentValidator } from "../validators/index.js";
import { ITypes } from "./inversify.types.js";
import { Container } from "inversify";

const container: Container = ICoreContainer;

container.bind<AddOnFactory>(ITypes.AddOnFactory).to(WxpAddOnFactory).inSingletonScope();

container.bind<DirectoryValidator>(ITypes.DirectoryValidator).to(AddOnDirectoryValidator).inSingletonScope();

container.bind<EnvironmentValidator>(ITypes.EnvironmentValidator).to(NodeEnvironmentValidator).inSingletonScope();

container.bind<TemplateSelector>(ITypes.TemplateSelector).to(AddOnTemplateSelector).inSingletonScope();

export { container as IContainer };
