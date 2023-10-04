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
 * Interface to track and trigger a registered action (based on a trottling rule) on entity changes.
 */
export interface EntityTracker {
    /**
     * Maximum amount of time after which
     * a message that is added to the queue through {@link track}
     * is executed on the registered action {@link registerAction}
     */
    readonly throttleTime: number;

    /**
     * Register an action to execute when a message is added.
     * @param action - Action to execute.
     */
    registerAction(action: (message: [string, Set<string>]) => unknown): void;

    /**
     * Add a message to the queue and
     * invoke the registered action {@link registerAction}
     * after {@link throttleTime} milliseconds.
     * @param id - Unique identifier of a message.
     * @param message - Message to add to the queue.
     */
    track(id: string, message: string): void;
}
