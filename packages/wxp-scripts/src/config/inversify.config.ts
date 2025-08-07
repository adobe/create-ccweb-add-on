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
import type { SSLData } from "@adobe/ccweb-add-on-ssl";
import cors from "cors";
import type { Express } from "express";
import express from "express";
import type { Server } from "https";
import { createServer } from "https";
import type { Container, interfaces } from "inversify";
import "reflect-metadata";
import { WebSocketServer } from "ws";
import { BuildCommandExecutor } from "../app/BuildCommandExecutor.js";
import { CleanCommandExecutor } from "../app/CleanCommandExecutor.js";
import type { CommandExecutor } from "../app/CommandExecutor.js";
import { ExpressServer } from "../app/ExpressServer.js";
import { PackageCommandExecutor } from "../app/PackageCommandExecutor.js";
import { ScriptManager } from "../app/ScriptManager.js";
import { SocketServer } from "../app/SocketServer.js";
import { StartCommandExecutor } from "../app/StartCommandExecutor.js";
import type { BuildCommandOptions } from "../models/BuildCommandOptions.js";
import type { PackageCommandOptions } from "../models/PackageCommandOptions.js";
import type { StartCommandOptions } from "../models/StartCommandOptions.js";
import { AddOnManifestReader } from "../utilities/AddOnManifestReader.js";
import { FileChangeTracker } from "../utilities/FileChangeTracker.js";
import type { CommandValidator } from "../validators/CommandValidator.js";
import { StartCommandValidator } from "../validators/StartCommandValidator.js";
import { ITypes } from "./inversify.types.js";

const container: Container = IContainer;

container.bind<Express>(ITypes.ExpressApp).toConstantValue(
    express()
        // The order of the following configurations matter.
        // Do not re-order.
        .use((_, response, next) => {
            response.set("Access-Control-Allow-Private-Network", "true");
            next();
        })
        .use(cors())
        .use(express.json())
        .use(express.urlencoded({ extended: true }))
        .use((_, response, next) => {
            response.set("Cross-Origin-Resource-Policy", "cross-origin");
            response.set("Cross-Origin-Embedder-Policy", "credentialless");
            next();
        })
);

container.bind<interfaces.Provider<Server>>(ITypes.SecureServer).toProvider<Server>(context => {
    return async (sslData: SSLData) => {
        return createServer(sslData, context.container.get<Express>(ITypes.ExpressApp));
    };
});

container.bind<interfaces.Factory<WebSocketServer>>(ITypes.SocketApp).toFactory<WebSocketServer, [Server]>(() => {
    return (server: Server) => {
        return new WebSocketServer({ server });
    };
});

container.bind<ExpressServer>(ITypes.ExpressServer).to(ExpressServer).inSingletonScope();

container.bind<SocketServer>(ITypes.SocketServer).to(SocketServer).inSingletonScope();

container.bind<ScriptManager>(ITypes.ScriptManager).to(ScriptManager).inSingletonScope();

container.bind<FileChangeTracker>(ITypes.FileChangeTracker).to(FileChangeTracker).inSingletonScope();

container.bind<AddOnManifestReader>(ITypes.AddOnManifestReader).to(AddOnManifestReader).inSingletonScope();

container
    .bind<CommandExecutor>(ITypes.CommandExecutor)
    .to(CleanCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("clean");

container
    .bind<CommandExecutor<BuildCommandOptions>>(ITypes.CommandExecutor)
    .to(BuildCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("build");

container
    .bind<CommandValidator<StartCommandOptions>>(ITypes.CommandValidator)
    .to(StartCommandValidator)
    .inSingletonScope()
    .whenTargetNamed("start");

container
    .bind<CommandExecutor<StartCommandOptions>>(ITypes.CommandExecutor)
    .to(StartCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("start");

container
    .bind<CommandExecutor<PackageCommandOptions>>(ITypes.CommandExecutor)
    .to(PackageCommandExecutor)
    .inSingletonScope()
    .whenTargetNamed("package");

export { container as IContainer };
