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
import { __decorate, __metadata } from "tslib";
import { injectable } from "inversify";
/**
 * Class to track file changes and trigger a registered action.
 */
let FileChangeTracker = class FileChangeTracker {
    /**
     * Unique set of file changes per id.
     */
    _changes;
    /**
     * Action to trigger when {@link track} is invoked.
     */
    _action;
    /**
     * Maximum amount of time after which
     * a message that is added to the queue through {@link track}
     * is executed on the registered action {@link registerAction}
     */
    throttleTime = 1000;
    /**
     * Instantiate {@link FileChangeTracker}.
     * @returns Reference to a new {@link FileChangeTracker} instance.
     */
    constructor() {
        this._changes = new Map();
        this._action = () => {
            return;
        };
    }
    /**
     * Register an action to execute when a message is added.
     * @param action - Action to execute.
     */
    registerAction(action) {
        this._action = action;
    }
    /**
     * Add the change information to the queue and
     * invoke the registered action {@link registerAction}
     * after {@link throttleTime} milliseconds.
     * @param id - Unique identifier per category/set of changes.
     * @param changeInfo - Information about the change.
     */
    track(id, changeInfo) {
        // From an add-ons' perspective, this `id` field is an add-on id
        // and a snapshot of the `_changes` map would look like:
        // [ add-on-1: [ /changed-file-1, /changed-file-2, ... ],
        //   add-on-2: [ /changed-file-3, /changed-file-4, ... ] ]
        const changes = this._changes.get(id) ?? new Set();
        changes.add(changeInfo);
        this._changes.set(id, changes);
        setTimeout(() => this._triggerAction(), this.throttleTime);
    }
    _triggerAction() {
        for (const change of Array.from(this._changes)) {
            this._action(change);
        }
        this._changes.clear();
    }
};
FileChangeTracker = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], FileChangeTracker);
export { FileChangeTracker };
//# sourceMappingURL=FileChangeTracker.js.map