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
import { __decorate } from "tslib";
import applicationConfigPath from "application-config-path";
import fs from "fs-extra";
import hjson from "hjson";
import { injectable } from "inversify";
import os from "os";
import path from "path";
import "reflect-metadata";
import { ADD_ON_PREFERENCES_FILE, CCWEB_ADDON_DIRECTORY } from "../constants.js";
import { PreferenceJson } from "../models/PreferenceJson.js";
/**
 * Implementation class for configuring CCWeb Add-on CLI related preferences.
 */
let CLIPreferences = class CLIPreferences {
    _cachedPreference;
    /**
     * Get the CCWeb Add-on CLI related user preferences.
     * @param fromCache - (Optional) Whether to return the cached user preference.
     * @returns User preference represented as {@link PreferenceJson}.
     */
    get(fromCache) {
        if (fromCache && this._cachedPreference !== undefined) {
            return this._cachedPreference;
        }
        try {
            const preferenceFilePath = this._preferenceFilePath;
            if (!fs.existsSync(preferenceFilePath)) {
                fs.ensureFileSync(preferenceFilePath);
                fs.writeFileSync(preferenceFilePath, JSON.stringify({}, undefined, 4) + os.EOL);
                return new PreferenceJson({});
            }
            const preferenceData = fs.readFileSync(preferenceFilePath, "utf-8").trim();
            this._cachedPreference = new PreferenceJson(hjson.parse(preferenceData));
            return this._cachedPreference;
        }
        catch {
            // Do not cache the preference when any error is encountered.
            return new PreferenceJson({});
        }
    }
    /**
     * Set the CCWeb Add-on CLI related user preferences.
     * @param preferenceJson - {@link PreferenceJson} reference.
     */
    set(preferenceJson) {
        fs.writeFileSync(this._preferenceFilePath, preferenceJson.toJSON() + os.EOL);
        this._cachedPreference = preferenceJson;
    }
    get _preferenceFilePath() {
        return path.join(applicationConfigPath(CCWEB_ADDON_DIRECTORY), ADD_ON_PREFERENCES_FILE);
    }
};
CLIPreferences = __decorate([
    injectable()
], CLIPreferences);
export { CLIPreferences };
//# sourceMappingURL=CLIPreferences.js.map