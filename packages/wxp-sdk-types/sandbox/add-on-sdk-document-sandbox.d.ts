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
 * The APIs provided by AddOn SDK for the document model sandbox.
 * The APIs are exposed as an ES6 module.
 * @public
 */
export declare class AddOnDocumentSandboxSdk {
    /**
     * Returns the instance of this AddOn.
     * @see AddOn
     */
    get instance(): AddOn;
}

/** @public - This object, exposed as the default, can be used in add-on's document model sandbox code. */
declare const addOnSandboxSdk: AddOnDocumentSandboxSdk;
export default addOnSandboxSdk;

/**
 * Takes the raw type of a remote object or function as a remote thread would see it through a proxy (e.g. when
 * passed in as a function argument) and returns the type the local thread has to supply.
 * Creation of new class objects is not allowed.
 *
 * This is the inverse of `Remote<T>`. It takes a `Remote<T>` and returns its original input `T`.
 */
declare type Local<T> = LocalObject<T> &
    (T extends (...args: infer TArguments) => infer TReturn
        ? (
              ...args: {
                  [I in keyof TArguments]: ProxyOrClone<TArguments[I]>;
              }
          ) => MaybePromise<UnproxyOrClone<Unpromisify<TReturn>>>
        : unknown) &
    (T extends {
        new (...args: infer TArguments): infer TInstance;
    }
        ? {
              new: never;
          }
        : unknown);

/**
 * Takes the type of an object as a remote thread would see it through a proxy (e.g. when passed in as a function
 * argument) and returns the type that the local thread has to supply.
 *
 * This does not handle call signatures, which is handled by the more general `Local<T>` type.
 *
 * This is the inverse of `RemoteObject<T>`.
 *
 * @template T The type of a proxied object.
 */
declare type LocalObject<T> = {
    [P in keyof T]: LocalProperty<T[P]>;
};

/**
 * Takes the raw type of a property as a remote thread would see it through a proxy (e.g. when passed in as a function
 * argument) and returns the type that the local thread has to supply.
 *
 * This is the inverse of `RemoteProperty<T>`.
 *
 * Note: This needs to be its own type alias, otherwise it will not distribute over unions. See
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
 */
declare type LocalProperty<T> = T extends Function | ProxyMarked ? Local<T> : Unpromisify<T>;

/**
 * Expresses that a type can be either a sync or async.
 */
declare type MaybePromise<T> = Promise<T> | T;

/**
 * Takes a type and wraps it in a Promise, if it not already is one.
 * This is to avoid `Promise<Promise<T>>`.
 *
 * This is the inverse of `Unpromisify<T>`.
 */
declare type Promisify<T> = T extends Promise<unknown> ? T : Promise<T>;

/**
 * Interface of values that were marked to be proxied with `Runtime.apiProxy()`.
 * Can also be implemented by classes.
 */
declare interface ProxyMarked {
    [proxyMarker]: true;
}

declare const proxyMarker: unique symbol;

/**
 * Proxies `T` if it is a `ProxyMarked`, clones it otherwise (as handled by structured cloning and transfer handlers).
 */
declare type ProxyOrClone<T> = T extends ProxyMarked ? Remote<T> : T;

/**
 * Takes the raw type of a remote object or function in the other thread and returns the type as it is visible to
 * the local thread from the proxy return value of `Runtime.apiProxy()`.
 * Creation of new class objects is not allowed.
 */
declare type Remote<T> = RemoteObject<T> &
    (T extends (...args: infer TArguments) => infer TReturn
        ? (
              ...args: {
                  [I in keyof TArguments]: UnproxyOrClone<TArguments[I]>;
              }
          ) => Promisify<ProxyOrClone<Unpromisify<TReturn>>>
        : unknown) &
    (T extends {
        new (...args: infer TArguments): infer TInstance;
    }
        ? {
              new: never;
          }
        : unknown);

/**
 * Takes the raw type of a remote object in the other thread and returns the type as it is visible to the local thread
 * when proxied with `Runtime.apiProxy()`.
 *
 * This does not handle call signatures, which is handled by the more general `Remote<T>` type.
 *
 * @template T The raw type of a remote object as seen in the other thread.
 */
declare type RemoteObject<T> = {
    [P in keyof T]: RemoteProperty<T[P]>;
};

/**
 * Takes the raw type of a remote property and returns the type that is visible to the local thread on the proxy.
 *
 * Note: This needs to be its own type alias, otherwise it will not distribute over unions.
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
 */
declare type RemoteProperty<T> = T extends Function | ProxyMarked ? Remote<T> : Promisify<T>;

/**
 * The instance of Runtime this AddOn is running into.
 * It contains methods to expose APIs from this runtime
 * and getting access to APIs exposed by other runtimes.
 */
export declare class Runtime {
    /**
     * The runtime-type of this Runtime.
     * Will always be "documentSandbox".
     */
    get type(): RuntimeType.documentSandbox;
    /**
     * Exposes the concrete object/function of type T,
     * which can be accessed into different runtime part of this AddOn e.g., "panel" (iframe) runtime.
     * Note that only concrete objects / class instances are supported. We can't expose entire class
     * from one runtime and create instance of that class in another runtime. Trying to do so will throw an exception.
     * @param obj - the concrete object to expose to other runtimes
     * Note: This method call is allowed only once. Subsequent calls are ignored.
     */
    exposeApi<T>(obj: T): void;
    /**
     * Requests a promise based proxy object for other runtimes, which will be used
     * by this document model sandbox to directly call the APIs exposed (using exposeApi) from the other runtimes (e.g., iframe UI runtime).
     * await or .then is necessary, since returned object is a promise.
     * @param runtimeType - the runtime, for which proxy object needs to be created.
     * @returns a promise which may resolve to a proxy or reject with rejection reason.
     * The promise resolves to API proxy object exposed by desired runtime, as soon as the other runtime is finished initializing.
     * Note: Calling the method again for same runtime type will return a new proxy object without any behavior difference.
     */
    apiProxy<T>(runtimeType: RuntimeType): Promise<Remote<T>>;
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
     * @deprecated Use 'documentSandbox' instead.
     * Represents document model sandbox part of this AddOn.
     */
    script = "script",
    /**
     * Represents document model sandbox part of this AddOn.
     */
    documentSandbox = "documentSandbox"
}

/**
 * Takes a type that may be Promise and unwraps the Promise type.
 * If `P` is not a Promise, it returns `P`.
 *
 * This is the inverse of `Promisify<T>`.
 */
declare type Unpromisify<P> = P extends Promise<infer T> ? T : P;

/**
 * Inverse of `ProxyOrClone<T>`.
 */
declare type UnproxyOrClone<T> = T extends RemoteObject<ProxyMarked> ? Local<T> : T;

export {};
