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

import type { Preferences } from "@adobe/ccweb-add-on-core";
import { ITypes as ICoreTypes } from "@adobe/ccweb-add-on-core";
import axios from "axios";
import { inject, injectable } from "inversify";
import osName from "os-name";
import "reflect-metadata";
import { ANALYTICS_API } from "../constants.js";
import { CLIProgram } from "../models/index.js";
import type { AnalyticsService } from "./AnalyticsService";

/**
 * Analytics service implementation.
 */
@injectable()
export class WxpAnalyticsService implements AnalyticsService {
    private readonly _preferences: Preferences;

    private _program: CLIProgram;

    private _startTime: number;

    /**
     * Instantiate {@link WxpAnalyticsService}.
     * @param preferences - {@link Preferences} reference.
     * @returns Reference to a new {@link WxpAnalyticsService} instance.
     */
    constructor(@inject(ICoreTypes.Preferences) preferences: Preferences) {
        this._preferences = preferences;

        this._program = new CLIProgram("", "");

        this._startTime = Date.now();
    }

    /**
     * Set the program which is being executed.
     * @param program - {@link CLIProgram} reference.
     */
    set program(program: CLIProgram) {
        this._program = program;
    }

    /**
     * Set the start time of an operation.
     */
    set startTime(time: number) {
        this._startTime = time;
    }

    /**
     * Post an event to Adobe analytics service.
     * @param eventType - Event type, either a SUCCESS, or an ERROR.
     * @param eventData - Event data.
     * @param isSuccess - Does the event represent a successful operation.
     * @returns Promise.
     */
    async postEvent(eventType: string, eventData: string, isSuccess: boolean): Promise<void> {
        try {
            const userPreferences = this._preferences.get();
            if (!userPreferences.hasTelemetryConsent) {
                return;
            }

            const currentTime = Date.now();
            const body = JSON.stringify({
                id: Math.floor(currentTime * Math.random()),
                timestamp: currentTime,
                _adobeio: {
                    eventType,
                    eventData,
                    cliVersion: this._program.version,
                    clientId: this._getClientId(),
                    command: this._program.name,
                    commandDuration: currentTime - this._startTime,
                    commandSuccess: isSuccess,
                    nodeVersion: process.version,
                    osNameVersion: osName()
                }
            });

            await axios.post(ANALYTICS_API.URL, body, { headers: ANALYTICS_API.HEADERS });
        } catch {
            return;
        }
    }

    private _getClientId(): number {
        const userPreferences = this._preferences.get();
        if (userPreferences.clientId === undefined) {
            userPreferences.clientId = Math.floor(Date.now() * Math.random());
            this._preferences.set(userPreferences);
        }

        return userPreferences.clientId;
    }
}
