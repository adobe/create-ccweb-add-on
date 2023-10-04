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
import type { EntityTracker } from "./EntityTracker.js";
/**
 * Class to track file changes and trigger a registered action.
 */
export declare class FileChangeTracker implements EntityTracker {
    /**
     * Unique set of file changes per id.
     */
    private _changes;
    /**
     * Action to trigger when {@link track} is invoked.
     */
    private _action;
    /**
     * Maximum amount of time after which
     * a message that is added to the queue through {@link track}
     * is executed on the registered action {@link registerAction}
     */
    readonly throttleTime = 1000;
    /**
     * Instantiate {@link FileChangeTracker}.
     * @returns Reference to a new {@link FileChangeTracker} instance.
     */
    constructor();
    /**
     * Register an action to execute when a message is added.
     * @param action - Action to execute.
     */
    registerAction(action: (message: [string, Set<string>]) => unknown): void;
    /**
     * Add the change information to the queue and
     * invoke the registered action {@link registerAction}
     * after {@link throttleTime} milliseconds.
     * @param id - Unique identifier per category/set of changes.
     * @param changeInfo - Information about the change.
     */
    track(id: string, changeInfo: string): void;
    private _triggerAction;
}
//# sourceMappingURL=FileChangeTracker.d.ts.map