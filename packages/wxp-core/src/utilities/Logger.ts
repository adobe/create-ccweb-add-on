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

import type { LoggerOptions } from "../models/index.js";

/**
 * Logger interface to handle logging of different levels.
 */
export interface Logger {
    /**
     * Log message.
     *
     * @param message - Message to log.
     * @param options - Logger {@link LoggerOptions} options.
     */
    message(message: string, options?: LoggerOptions): void;

    /**
     * Log information message.
     *
     * @param message - Message to log.
     * @param options - Logger {@link LoggerOptions} options.
     */
    information(message: string, options?: LoggerOptions): void;

    /**
     * Log success message.
     *
     * @param message - Message to log.
     * @param options - Logger {@link LoggerOptions} options.
     */
    success(message: string, options?: LoggerOptions): void;

    /**
     * Log warning message.
     *
     * @param message - Message to log.
     * @param options - Logger {@link LoggerOptions} options.
     */
    warning(message: string, options?: LoggerOptions): void;

    /**
     * Log error message.
     *
     * @param message - Message to log.
     * @param options - Logger {@link LoggerOptions} options.
     */
    error(message: unknown, options?: LoggerOptions): void;
}
