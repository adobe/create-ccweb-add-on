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

import { Remote } from "comlink";

/**
 * Represents the instance of this AddOn.
 * The instance contains the necessary details like the associated Runtime etc.
 */
export declare class AddOn {
    /**
     * Get the runtime instance, which represents
     * the execution environment for this AddOn.
     */
    get runtime(): Runtime;
}

/**
 * The APIs provided by AddOn Script SDK.
 * The APIs are exposed as an ES6 module.
 */
export declare class AddOnScriptSDK {
    /**
     * Returns the instance of this AddOn.
     * @see AddOn
     */
    get instance(): AddOn;
}

declare const addOnScriptSdk: AddOnScriptSDK;
export default addOnScriptSdk;

/**
 * The instance of Runtime this AddOn is running into.
 * It contains methods to expose APIs from this runtime
 * and getting access to APIs exposed by other runtimes.
 */
export declare class Runtime {
    /**
     * The runtime-type of this Runtime.
     * Will always be "script".
     */
    get type(): RuntimeType.script;
    /**
     * Exposes the concrete object/function of type T,
     * which can be accessed into different runtime part of this AddOn e.g., "panel" (iframe) runtime.
     * Note that only concrete objects / class instances are supported. We can't expose entire class
     * from one runtime and create instance of that class in another runtime. Trying to do
     * so may result in undefined behaviour.
     * @param obj - the concrete object to expose to other runtimes
     * Note: This method call is allowed only once. Subsequent calls are ignored.
     */
    exposeApi<T>(obj: T): void;
    /**
     * Requests a promise based proxy object for other runtimes, which will be used
     * by this script runtime to directly call the APIs exposed (using exposeApi) from the other runtimes (e.g., UI runtime).
     * await or .then is necessary, since returned object is a promise.
     * @param runtimeType - the runtime, for which proxy object needs to be created.
     * @returns a promise which may resolve to a proxy or reject with rejection reason.
     * The promise resolves to API proxy object exposed by desired runtime, as soon as the other runtime is finished initializing.
     * Note: Calling the method again for same runtime type will return a new proxy object without any behavior difference.
     */
    apiProxy(runtimeType: RuntimeType): Promise<Remote<unknown>>;
}

/**
 * Supported runtime types for this AddOn.
 */
export declare enum RuntimeType {
    /**
     * Represents iframe runtime part of this AddOn.
     */
    panel = "panel",
    /**
     * Represents Script runtime part of this AddOn.
     */
    script = "script"
}

export {};
