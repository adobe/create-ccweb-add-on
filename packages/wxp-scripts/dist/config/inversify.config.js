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
import { IContainer } from "@adobe/ccweb-add-on-core";
import cors from "cors";
import express from "express";
import { createServer } from "https";
import "reflect-metadata";
import { WebSocketServer } from "ws";
import { BuildCommandExecutor } from "../app/BuildCommandExecutor.js";
import { CleanCommandExecutor } from "../app/CleanCommandExecutor.js";
import { PackageCommandExecutor } from "../app/PackageCommandExecutor.js";
import { StartCommandExecutor } from "../app/StartCommandExecutor.js";
import { WxpExpressServer, WxpScriptManager, WxpSocketServer } from "../app/index.js";
import { AddOnManifestReader, FileChangeTracker } from "../utilities/index.js";
import { StartCommandValidator } from "../validators/StartCommandValidator.js";
import { ITypes } from "./inversify.types.js";
const container = IContainer;
container.bind(ITypes.ExpressApp).toConstantValue(express()
    .use(cors())
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use((_, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.set("Cross-Origin-Embedder-Policy", "credentialless");
    next();
}));
container.bind(ITypes.SecureServer).toProvider(context => {
    return async (sslData) => {
        return createServer(sslData, context.container.get(ITypes.ExpressApp));
    };
});
container.bind(ITypes.SocketApp).toFactory(() => {
    return (server) => {
        return new WebSocketServer({ server });
    };
});
container.bind(ITypes.ExpressServer).to(WxpExpressServer).inSingletonScope();
container.bind(ITypes.SocketServer).to(WxpSocketServer).inSingletonScope();
container.bind(ITypes.ScriptManager).to(WxpScriptManager).inSingletonScope();
container.bind(ITypes.EntityTracker).to(FileChangeTracker).inSingletonScope();
container.bind(ITypes.AddOnManifestReader).to(AddOnManifestReader).inSingletonScope();
container
    .bind(ITypes.CommandExecutor)
    .to(CleanCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("clean");
container
    .bind(ITypes.CommandExecutor)
    .to(BuildCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("build");
container
    .bind(ITypes.CommandValidator)
    .to(StartCommandValidator)
    .inSingletonScope()
    .whenTargetNamed("start");
container
    .bind(ITypes.CommandExecutor)
    .to(StartCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("start");
container
    .bind(ITypes.CommandExecutor)
    .to(PackageCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("package");
export { container as IContainer };
//# sourceMappingURL=inversify.config.js.map