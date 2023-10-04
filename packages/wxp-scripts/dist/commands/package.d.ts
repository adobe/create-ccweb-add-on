#!/usr/bin/env node
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
import type { Config } from "@oclif/core";
import { Command } from "@oclif/core";
import "reflect-metadata";
/**
 * Package Command's implementation class.
 */
export declare class Package extends Command {
    private readonly _analyticsConsent;
    private readonly _analyticsService;
    private readonly _commandExecutor;
    static description: string;
    static args: {};
    static flags: {
        src: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        use: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "no-rebuild": import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        analytics: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        verbose: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    constructor(argv: string[], config: Config);
    run(): Promise<void>;
    catch(error: {
        message: string;
    }): Promise<void>;
    private _seekAnalyticsConsent;
}
//# sourceMappingURL=package.d.ts.map