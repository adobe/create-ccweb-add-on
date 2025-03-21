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

import type { SSLData } from "../models/index.js";

/**
 * Contracts for reading the SSL artifacts.
 */
export interface SSLReader {
    /**
     * Is SSL set up manually by the user.
     * @param hostname - Hostname in the SSL certificate.
     * @returns Boolean value representing whether SSL is set up manually.
     */
    isCustomSSL(hostname: string): boolean;

    /**
     * Is SSL set up automatically by the tool.
     * @param hostname - Hostname in the SSL certificate.
     * @returns Boolean value representing whether SSL is set up automatically.
     */
    isWxpSSL(hostname: string): boolean;

    /**
     * Read the SSL artifacts.
     * @param hostname - Hostname in the SSL certificate.
     * @param port - Port where the add-on is being hosted.
     * @returns Promise of {@link SSLData}.
     */
    read(hostname: string, port: number): Promise<SSLData>;
}
