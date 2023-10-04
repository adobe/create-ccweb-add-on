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
 * Action representing the type of change triggering the notification.
 * Version - 1
 */
export declare enum AddOnActionV1 {
    /**
     * Action triggered when the source code of an Add-on is changed.
     */
    SourceCodeChanged = "SourceCodeChanged"
}
/**
 * Information about the Add-on source code change.
 * Version - 1
 */
export declare class AddOnSourceChangedPayloadV1 {
    /**
     * Files that were changed.
     */
    readonly changedFiles: string[];
    /**
     * Whether the build is successful after the change.
     */
    readonly isBuildSuccessful: boolean;
    /**
     * Whether the manifest is changed.
     */
    readonly isManifestChanged: boolean;
    /**
     * Add-on manifest.
     */
    readonly manifest?: Record<string, unknown>;
    /**
     * Instantiate {@link AddOnSourceChangedPayloadV1}.
     * @param changedFiles - Files that were changed.
     * @param isBuildSuccessful - Whether the build is successful after the change.
     * @param isManifestChanged - Whether the manifest is changed.
     * @param manifest - Add-on manifest.
     * @returns Reference to a new {@link AddOnSourceChangedPayloadV1} instance.
     */
    constructor(changedFiles: string[], isBuildSuccessful: boolean, isManifestChanged: boolean, manifest?: Record<string, unknown>);
    /**
     * Get the payload properties for serialization.
     * @returns Payload properties.
     */
    getProperties(): this;
}
/**
 * CLI Script Message that is broadcasted over WebSocket
 * indicating an action that has occurred on the Add-on.
 * Version - 1
 */
export declare class CLIScriptMessageV1 {
    /**
     * CLI script message version.
     */
    readonly messageVersion = 1;
    /**
     * Add-on ID.
     */
    readonly id: string;
    /**
     * Action that has occurred on the Add-on.
     */
    readonly action: AddOnActionV1;
    /**
     * Payload containing details about the Add-on change.
     */
    readonly payload: AddOnSourceChangedPayloadV1;
    /**
     * Instantiate {@link CLIScriptMessageV1}.
     * @param id - Add-on identifier.
     * @param action - Action that has occurred on the Add-on.
     * @param payload - Payload containing details about the Add-on change.
     * @returns Reference to a new {@link CLIScriptMessageV1} instance.
     */
    constructor(id: string, action: AddOnActionV1, payload: AddOnSourceChangedPayloadV1);
    /**
     * Get serialized JSON representation of {@link AddOnNotificationV1}.
     * @returns Serialized JSON as string.
     */
    toJSON(): string;
}
//# sourceMappingURL=CLIScriptMessageV1.d.ts.map