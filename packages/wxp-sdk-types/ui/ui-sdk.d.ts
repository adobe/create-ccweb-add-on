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
 * Base interface for all type of add-ons
 */
export declare interface AddOn extends AddOnBase {
    /**
     * Represents the current add-on runtime
     */
    readonly runtime: Runtime;
    /**
     * Add-ons Manifest details - this maps to entries in the add-ons manifest.json file.
     */
    readonly manifest: Record<string, unknown>;
    /**
     * Local-persisted storage per user per addon.
     */
    readonly clientStorage: ClientStorage;
}

/**
 * Interface that represents the APIs directly exposed by the AddOn interface
 */
declare interface AddOnBase {}

/**
 * @public
 * The main API Interface exposed by this SDK to the consuming Add-on code.
 */
export declare interface AddOnSDKAPI {
    /**
     * api version of this sdk.
     */
    readonly apiVersion: string;
    /**
     * Returns a Promise that resolves when the AddOn connection with the Host application is successful.
     * AddOn can use the Host APIs exposed by the SDK only after the connection with the host is complete & successful.
     * Register a call back with @see Promise#then or await this promise.
     */
    readonly ready: Promise<void>;
    /**
     * Represents the Add-on Instance. The interface type depends on the type of the underlying Add-on.
     */
    readonly instance: AddOn;
    /**
     * Represents the Application Object. Use this object to manage the underlying application.
     */
    readonly app: Application;
    /**
     * Represents the Constants Object.
     */
    readonly constants: typeof Constants;
}

declare const addOnSDKAPI: AddOnSDKAPI;
export default addOnSDKAPI;

/**
 * Type of alert dialog data passed from the add-on.
 */
export declare interface AlertDialogOptions extends DialogOptions {
    /**
     * Variant
     */
    variant: Variant.confirmation | Variant.information | Variant.warning | Variant.destructive | Variant.error;
    /**
     * Description
     */
    description: LocalizedString;
    /**
     * Buttons
     */
    buttonLabels?: ButtonLabels;
}

export declare interface AlertDialogResult extends DialogResult {
    /**
     * Type of dialog result
     */
    type: DialogResultType.alert;
}

/**
 * The payload data sent to the App dragEnd event handler.
 */
export declare interface AppDragEndEventData {
    dropCancelled: boolean;
    element: HTMLElement;
    dropCancelReason?: string;
}

/**
 * The payload data sent to the App dragStart event handler.
 */
export declare interface AppDragStartEventData {
    element: HTMLElement;
}

/**
 * Application related Events
 */
export declare enum AppEvent {
    /**
     * triggered when the UI theme is changed in the application.
     */
    themechange = "themechange",
    /**
     * triggered when the locale is changed in the application.
     */
    localechange = "localechange",
    /**
     * triggered when the regional format is changed in the application.
     */
    formatchange = "formatchange",
    /**
     * triggered when the sdk is reset.
     */
    reset = "reset",
    /**
     * triggered when drag is started on the currently dragged element.
     */
    dragstart = "dragstart",
    /**
     * triggered when drag is complete on the currently dragged element.
     */
    dragend = "dragend",

    /**
     * triggered when the document id is available in the application.
     */
    documentIdAvailable = "documentIdAvailable",
    /**
     * triggered when the document title is changed in the application.
     */
    documentTitleChange = "documentTitleChange"
}

export declare type AppEventHandlerType<Event extends AppEventType> = (data: AppEventsTypeMap[Event]) => void;

/**
 * Provides Type mappings between Events and their corresponding data delivered to the handler.
 */
declare interface AppEventsTypeMap {
    [AppEvent.themechange]: AppThemeChangeEventData;
    [AppEvent.localechange]: AppLocaleChangeEventData;
    [AppEvent.formatchange]: AppFormatChangeEventData;
    [AppEvent.reset]: undefined;
    [AppEvent.dragstart]: AppDragStartEventData;
    [AppEvent.dragend]: AppDragEndEventData;

    [AppEvent.documentIdAvailable]: DocumentIdAvailableEventData;
    [AppEvent.documentTitleChange]: DocumentTitleChangeEventData;
}

export declare type AppEventType = keyof AppEventsTypeMap & string;

/**
 * The payload data sent to the App FormatChange event handler.
 */
export declare interface AppFormatChangeEventData {
    format: string;
}

/**
 * Interface that represents the underlying Application.
 */
export declare interface Application extends ApplicationBase {
    /**
     * object represents the {@link UI} of the app.
     */
    readonly ui: UI;
    /**
     * Represents the active document of the host application
     */
    readonly document: Document_2;
    /**
     * OAuth 2.0 middleware for handling user authorization.
     */
    readonly oauth: OAuth;
    /**
     * Represents current logged-in user accessing host application
     */
    readonly currentUser: CurrentUser;
    /**
     * Represents flags which can be used to simulate certain behavior during development.
     */
    devFlags: DevFlags;
}

/**
 * Interface that represents the APIs directly exposed by the Application interface
 */
declare interface ApplicationBase {
    /**
     * Register handler for an application event.
     * @param name - Event to subscribe to. Can be one of {@link AppEvent}
     * @param handler - Handler that gets invoked when the event is triggered.
     */
    on<T extends AppEventType>(name: T, handler: AppEventHandlerType<T>): void;
    /**
     * Un-register the handler from the given event.
     * @param name - Event to un-subscribe from.
     * @param handler - Handler that was used during Event subscription.
     */
    off<T extends AppEventType>(name: T, handler: AppEventHandlerType<T>): void;
    /**
     * Enable drag to document on the given element
     * @param element - Element to enable drag on.
     * @param dragCallbacks - Interface to pass all drag realated callbacks (previewCallback & completionCallback).
     * @param dragOptions - Interface to pass all drag related options.
     * @returns DisableDragToDocument - Callback to undo the changes made by enableDragToDocument
     */
    enableDragToDocument(
        element: HTMLElement,
        dragCallbacks: DragCallbacks,
        dragOptions?: DragOptions
    ): DisableDragToDocument;
    /**
     * @experimental - Experimental API
     * Register iframe with the add-on SDK.
     * @param element - HTMLIframeElement to be registered.
     * @returns UnregisterIframe - Callback to unregister iframe from the add-on SDK.
     */
    registerIframe(element: HTMLIFrameElement): UnregisterIframe;
    /**
     * Show a modal dialog
     * @param dialogOptions - dialog options such as title, description, etc.
     * @returns DialogResult with button that was clicked or error otherwise.
     */
    showModalDialog(dialogOptions: AlertDialogOptions): Promise<AlertDialogResult>;
    showModalDialog(dialogOptions: InputDialogOptions): Promise<InputDialogResult>;
    showModalDialog(dialogOptions: CustomDialogOptions): Promise<CustomDialogResult>;

    /**
     * Triggers/Starts the in-app monetization upgrade flow
     * @returns if the user is premium user or not
     */
    startPremiumUpgradeIfFreeUser(): Promise<boolean>;
    /**
     * Get information regarding current platform.
     * @returns the details regarding the current platform.
     */
    getCurrentPlatform(): Promise<CurrentPlatformPayload>;
}

/**
 * The payload data sent to the App LocaleChange event handler.
 */
export declare interface AppLocaleChangeEventData {
    locale: string;
}

/**
 * The payload data sent to the App ThemeChange event handler.
 */
export declare interface AppThemeChangeEventData {
    theme: UiTheme;
}

/**
 * Asset collection Id type.
 */
export declare type AssetCollectionId = `urn:aaid:sc:VA6C2:${string}`;

/**
 * Request parameters to authorize a user using OAuth 2.0 PKCE based authorization.
 */
export declare type AuthorizationRequest = {
    /**
     * OAuth provider's authorization URL.
     */
    authorizationUrl: string;
    /**
     * Client identifier of the application created at the OAuth provider.
     */
    clientId: string;
    /**
     * Code challenge used in Authorization Code Exchange.
     */
    codeChallenge: string;
    /**
     * Scope to control the application's access.
     */
    scope: string;
    /**
     * Authorization window size.
     */
    windowSize?: {
        width: number;
        height: number;
    };
    /**
     * Additional parameters, specific to an OAuth provider which
     * are required in the Authorization URL as query string parameters.
     */
    additionalParameters?: Map<string, string>;
};

/**
 * Response containing the properties that can be used
 * only ONCE to obtain the access and/or refresh tokens.
 */
export declare type AuthorizationResponse = {
    /**
     * Unique identifier for the authorization request.
     */
    id: string;
    /**
     * OAuth 2.0 generated authorization code which can be used
     * ONCE to obtain an access token and a refresh token.
     */
    code: string;
    /**
     * URL where the user is redirected to after authorization.
     * This is the default URL owned by Adobe and
     * it is this URL which needs to be used to obtain access_token.
     */
    redirectUri: string;
    /**
     * Authorization result which denotes either success or failure,
     * represented by {@link AuthorizationResult}.
     */
    result: AuthorizationResult;
};

/**
 * Authorization result describing success or failure.
 */
export declare type AuthorizationResult = {
    /**
     * Status representing success or failure in the authorization workflow.
     */
    status: AuthorizationStatus;
    /**
     * Description about the success or failure in the authorization workflow.
     * In the event of a FAILED status reported by the OAuth provider during authorization,
     * the value of this property is an object, in the form of \{ [failure_title]: \"failure_description\" \}
     * While for all other statuses the value of this property is a string.
     */
    description: string | object;
};

/**
 * Authorization status.
 */
export declare enum AuthorizationStatus {
    SUCCESS = "SUCCESS",
    POPUP_OPENED = "POPUP_OPENED",
    POPUP_BLOCKED = "POPUP_BLOCKED",
    POPUP_CLOSED = "POPUP_CLOSED",
    POPUP_TIMEOUT = "POPUP_TIMEOUT",
    FAILED = "FAILED"
}

/**
 * Request parameters to initiate an OAuth 2.0 PKCE based authorization workflow,
 * where the Add-on developer is responsible for handling redirect to his/her owned Redirect URL.
 */
export declare type AuthorizeWithOwnRedirectRequest = AuthorizationRequest & {
    /**
     * URL where the user is redirected to after authorization.
     * Hosting and handling redirects to this URL should be managed by the caller.
     */
    redirectUri: string;
    /**
     * A value which is preserved in the authorization request,
     * and replayed back as a query string parameter in the redirectUri.
     * Although the primary reason for using the state parameter is to mitigate CSRF attacks,
     * it can also be used to encode any other information.
     */
    state: string;
};

/**
 * Bleed for the page.
 * In printing, bleed is printing that goes beyond the edge of where the sheet will be trimmed.
 * In other words, the bleed is the area to be trimmed off.
 */
export declare interface Bleed {
    /**
     * The amount for the bleed
     */
    amount: number;
    /**
     * The unit in which the bleed amount is expressed
     */
    unit: BleedUnit;
}

/**
 * Units for the page bleed.
 */
export declare enum BleedUnit {
    /**
     * Inch
     */
    Inch = "in",
    /**
     * Millimeter
     */
    Millimeter = "mm"
}

export declare interface ButtonLabels {
    /**
     * Primary action label
     * Default label is "OK".
     */
    primary?: LocalizedString;
    /**
     * Secondary action label
     */
    secondary?: LocalizedString;
    /**
     * Cancel action label
     */
    cancel?: LocalizedString;
}

/**
 * Button types for Simple Dialog
 */
export declare enum ButtonType {
    /**
     * Primary button pressed
     */
    primary = "primary",
    /**
     * Secondary button pressed
     */
    secondary = "secondary",
    /**
     * Cancel button pressed
     */
    cancel = "cancel",
    /**
     * Dialog closed via ESC or close(X) button
     */
    close = "close"
}

/**
 * Local-persisted storage per user per addon.
 * This interface provides methods to store/retrieve/delete data to clientStorage.
 */
export declare interface ClientStorage {
    /**
     * Retrieve a value from ClientStorage for given key.
     * If no value has been stored for that key, this function will asynchronously return undefined.
     */
    getItem(key: string): Promise<unknown>;
    /**
     * Set a value to ClientStorage with the given key.
     * The returned promise will resolve if storage is successful or reject with an error message if storage failed.
     */
    setItem(key: string, value: unknown): Promise<void>;
    /**
     * Remove the stored key/value pair from ClientStorage for given key.
     * If no such key is stored, this function will return normally but will otherwise do nothing.
     */
    removeItem(key: string): Promise<void>;
    /**
     * Retrieve a list of all keys stored to ClientStorage.
     * Use this to enumerate the full contents of the ClientStorage API.
     */
    keys(): Promise<string[]>;
    /**
     * Delete all data present in ClientStorage for an Add-on.
     */
    clear(): Promise<void>;
}

declare namespace Constants {
    export {
        Range_2 as Range,
        RenditionFormat,
        RenditionType,
        RenditionIntent,
        Variant,
        FieldType,
        DialogResultType,
        ButtonType,
        RuntimeType,
        BleedUnit,
        VideoResolution,
        EditorPanel,
        MediaTabs,
        ElementsTabs,
        PanelActionType,
        PlatformEnvironment,
        DeviceClass,
        PlatformType,
        AuthorizationStatus
    };
}
export { Constants };

/**
 * Interface for the current platform
 */
export declare interface CurrentPlatformPayload {
    /**
     * Purchases are NOT allowed in the {@link PlatformEnvironment.app} as of now
     */
    inAppPurchaseAllowed: boolean;
    /**
     * Denotes the platform type
     */
    platform: PlatformType;
    /**
     * Denotes the current environment
     */
    environment: PlatformEnvironment;
    /**
     * Denotes the device class
     */
    deviceClass: DeviceClass;
}

/**
 * Represents the current logged-in user accessing the host application
 */
export declare interface CurrentUser {
    /**
     * Get user Id
     */
    userId(): Promise<string>;

    /**
     * @returns if the current user is a premium user
     */
    isPremiumUser(): Promise<boolean>;
}

/**
 * Type of custom dialog data passed from the add-on.
 */
export declare interface CustomDialogOptions extends DialogOptions {
    /**
     * Variant
     */
    variant: Variant.custom;
    /**
     * HTML file containing the custom UI to be rendered inside the dialog
     */
    src: string;
    /**
     * Requested size
     */
    size?: {
        width: number;
        height: number;
    };
}

export declare interface CustomDialogResult extends DialogResult {
    /**
     * Type of dialog result
     */
    type: DialogResultType.custom;
    /**
     * Dialog result
     */
    result: unknown;
}

/**
 * Interface that contains methods and properties that are Application Dev Flags related.
 */
export declare interface DevFlags {
    /**
     * Simulate APIs as a free user.
     */
    simulateFreeUser: boolean;
}

/**
 * Denotes the device class
 */
export declare enum DeviceClass {
    /**
     * Mobile Device
     */
    mobile = "mobile",
    /**
     * Tablet Device
     */
    tablet = "tablet",
    /**
     * Desktop
     */
    desktop = "desktop"
}

/**
 * Represents the Modal Dialog that the add-on has presented to the user.
 */
export declare interface Dialog {
    /**
     * Closes the modal dialog and post result back to the dialog invoker
     */
    close(result?: unknown): void;
}

/**
 * Type of dialog data passed from the add-on.
 */
export declare interface DialogOptions {
    /**
     * Variant
     */
    variant: Variant;
    /**
     * Title
     */
    title: LocalizedString;
}

/**
 * Internal type (not exposed to the end user)
 */
export declare interface DialogResult {
    /**
     * Type of dialog result
     */
    type: DialogResultType;
    /**
     * Clicked button
     */
    buttonType: ButtonType;
}

/**
 * The type of the dialog result
 */
export declare enum DialogResultType {
    /**
     * Alert dialog result
     */
    alert = "alert",
    /**
     * Input dialog result
     */
    input = "input",
    /**
     * Custom dialog result
     */
    custom = "custom"
}

/**
 * Callback to undo the changes made by enableDragToDocument
 */
export declare type DisableDragToDocument = () => void;

/**
 * Represents the active document of the host application
 */
declare interface Document_2 {
    /**
     * Add image/Ps/Ai files to the current page
     */
    addImage(blob: Blob, attributes?: MediaAttributes): Promise<void>;
    /**
     * Add GIF files to the current page
     */
    addAnimatedImage(blob: Blob, attributes?: MediaAttributes): Promise<void>;
    /**
     * Add video to the current page
     */
    addVideo(blob: Blob): Promise<void>;
    /**
     * Add audio to the current page
     */
    addAudio(blob: Blob, attributes: MediaAttributes): Promise<void>;

    /**
     * Create renditions
     */
    createRenditions(renditionOptions: RenditionOptions, renditionIntent?: RenditionIntent): Promise<Rendition[]>;
    /**
     * Get metadata of all or range of pages of the document
     */
    getPagesMetadata(options: PageMetadataOptions): Promise<PageMetadata[]>;
    /**
     * Get document id
     */
    id(): Promise<string | undefined>;
    /**
     * Get document name/title
     */
    title(): Promise<string>;
}
export { Document_2 as Document };

/**
 * The payload data sent to the document id available event handler.
 */
declare interface DocumentIdAvailableEventData {
    documentId: string | undefined;
}

/**
 * The payload data sent to the document title change event handler.
 */
declare interface DocumentTitleChangeEventData {
    documentTitle: string;
}

/**
 * Interface to hold various callbacks which are required to be passed to enableDragToDocument.
 */
export declare interface DragCallbacks {
    /**
     * Callback used to get the preview image for the drag & drop action @returns URL.
     */
    previewCallback: DragPreviewCallback;
    /**
     * Callback used to get the final data to be added to the document post drag & drop action @returns DragCompletionData[].
     */
    completionCallback: DragCompletionCallback;
}

export declare type DragCompletionCallback = (element: HTMLElement) => Promise<DragCompletionData[]>;

/**
 * Data to be added to the document on drag completion.
 */
export declare interface DragCompletionData {
    /**
     * Blob (image/gif/video/audio) to be added to the document
     */
    blob: Blob;
    /**
     * Media info
     */
    attributes?: MediaAttributes;
}

/**
 * Interface to provide drag options which can be passed to enableDragToDocument to change the drag behavior.
 */
declare interface DragOptions {
    /**
     * Use preview size for the drag image instead of the element size
     */
    usePreviewSizeForDragImage?: boolean;
}

export declare type DragPreviewCallback = (element: HTMLElement) => URL;

/**
 * Express editor panels.
 */
export declare enum EditorPanel {
    /**
     * Editor search panel
     */
    search = "search",
    /**
     * Editor your stuff panel
     */
    yourStuff = "yourStuff",
    /**
     * Editor templates panel
     */
    templates = "templates",
    /**
     * Editor media panel
     */
    media = "media",
    /**
     * Editor text panel
     */
    text = "text",
    /**
     * Editor elements panel
     */
    elements = "elements",
    /**
     * Editor grids panel
     */
    grids = "grids",
    /**
     * Editor brands panel
     */
    brands = "brands",
    /**
     * Editor addOns panel
     */
    addOns = "addOns"
}

/**
 * Tabs in editor Elements panel.
 */
export declare enum ElementsTabs {
    /**
     * Design assets tab.
     */
    designAssets = "designAssets",
    /**
     * Backgrounds tab.
     */
    backgrounds = "backgrounds",
    /**
     * Shapes assets tab.
     */
    shapes = "shapes",
    /**
     * Icons tab.
     */
    stockIcons = "stockIcons",
    /**
     * Charts tab.
     */
    charts = "charts"
}

export declare interface Field {
    /**
     * Label
     */
    label: LocalizedString;
    /**
     * Specifies a short hint that describes the expected value of the field
     */
    placeholder?: LocalizedString;
    /**
     * Initial value of the field
     */
    initialValue?: LocalizedString;
    /**
     * Type of the field
     */
    fieldType: FieldType;
}

/**
 * The type of the input field in Simple Dialog.
 */
export declare enum FieldType {
    /**
     * One-line text input field
     */
    text = "text"
}

/**
 * Type of input dialog data passed from the add-on.
 */
export declare interface InputDialogOptions extends DialogOptions {
    /**
     * Variant
     */
    variant: Variant.input;
    /**
     * Description
     */
    description: LocalizedString;
    /**
     * Buttons
     */
    buttonLabels?: ButtonLabels;
    /**
     * Input field
     */
    field: Field;
}

export declare interface InputDialogResult extends DialogResult {
    /**
     * Type of dialog result
     */
    type: DialogResultType.input;
    /**
     * Field value
     */
    fieldValue: string;
}

export declare interface JpgRenditionOptions extends RenditionOptions {
    /**
     * JPG rendition format
     */
    format: RenditionFormat.jpg;
    /**
     * The background color for the image.
     * By default it is derived from the entity for which the rendition needs to be created.
     * Integer in 0xRRGGBB format.
     */
    backgroundColor?: number;
    /**
     * A number between 0 and 1, indicating image quality. Default is 1.0
     */
    quality?: number;
    /**
     * Requested size
     */
    requestedSize?: {
        width?: number;
        height?: number;
    };
}

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
 * Placeholder for future localization support
 */
export declare type LocalizedString = string;

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
 * Media Attributes for importing media
 */
export declare interface MediaAttributes {
    /**
     * Media title
     */
    title: string;
    /**
     * Media author
     */
    author?: string;
}

/**
 * Tabs in editor media panel.
 */
export declare enum MediaTabs {
    /**
     * Video tab.
     */
    video = "video",
    /**
     * Audio tab.
     */
    audio = "audio",
    /**
     * Photos tab.
     */
    photos = "photos"
}

export declare interface Mp4RenditionOptions extends RenditionOptions {
    /**
     * mp4 rendition format
     */
    format: RenditionFormat.mp4;
    /**
     * Video resolution
     */
    resolution?: VideoResolution;
    /**
     * Custom Resolution (in pixel)
     */
    customResolution?: number;
}

/**
 * Navigation action that can be performed on Editor panels.
 */
export declare interface NavigateAction extends PanelAction {
    /**
     * Navigate to collection action type.
     */
    type: PanelActionType.navigate;
    /**
     *
     */
    tab?: ElementsTabs | MediaTabs;
    /**
     * collectionId of the asset collection to navigate to.
     */
    collectionId?: AssetCollectionId;
}

/**
 * OAuth 2.0 middleware for handling user sign-in.
 */
export declare interface OAuth {
    /**
     * Authorize a user using OAuth 2.0 PKCE workflow.
     * @param request - {@link AuthorizationRequest} Payload with parameters to be used in the authorization workflow.
     * @returns - {@link AuthorizationResponse} Response containing a ONE-TIME Authorization Code which can be used to obtain an access token.
     */
    authorize(request: AuthorizationRequest): Promise<AuthorizationResponse>;
    /**
     * Initiate the OAuth 2.0 PKCE authorization workflow by opening the user sign-in window.
     * Post authorization the user is redirected to the Add-on developer provided URL.
     * @param request - {@link AuthorizeWithOwnRedirectRequest} Payload with parameters to be used in the authorization workflow.
     * @returns - {@link AuthorizationResult} Authorization result.
     */
    authorizeWithOwnRedirect(request: AuthorizeWithOwnRedirectRequest): Promise<AuthorizationResult>;
}

/**
 * Represents the metadata of the Page
 */
export declare interface PageMetadata {
    /**
     * Unique id that represent the given page
     */
    id: string;
    /**
     * Page title
     */
    title: string;
    /**
     * Page size in pixels
     */
    size: {
        width: number;
        height: number;
    };
    /**
     * Whether page contains any premium content
     */
    hasPremiumContent: boolean;
    /**
     * Whether page contains timelines
     */
    hasTemporalContent: boolean;
    /**
     * Pixels per inch of the page
     */
    pixelsPerInch?: number;
    /**
     * Whether page is ready to print
     */
    isPrintReady?: boolean;
}

/**
 * Options for fetching page metadata
 */
export declare interface PageMetadataOptions {
    /**
     * Page range of the document to get the metadata
     */
    range: Range_2;
    /**
     * Ids of the pages (Only required if the range is "specificPages")
     */
    pageIds?: string[];
}

export declare interface PageRendition extends Rendition {
    /**
     * Page rendition type
     */
    type: RenditionType.page;
    /**
     * Page title
     */
    title: string;
    /**
     * Page metadata
     */
    metadata: PageMetadata;
}

/**
 * Represents the action to be performed on opening an Editor panel.
 */
export declare interface PanelAction {
    /**
     * Type of action to be performed on the Editor panel {@link PanelActionType}.
     */
    type: PanelActionType;
}

/**
 * Types of actions that can be performed on Editor panels.
 */
export declare enum PanelActionType {
    /**
     * Action type to perform search action on Editor panel.
     */
    search = "search",
    /**
     * Action type to perform navigation within Editor panel.
     */
    navigate = "navigate"
}

/**
 * Represents a PDF Page box
 */
export declare interface PdfPageBox {
    /**
     * Margins for a box
     */
    margins: PdfPageBoxMargins;
}

/**
 * All the PDF Page boxes (MediaBox, BleedBox, CropBox, TrimBox)
 */
export declare interface PdfPageBoxes {
    /**
     * Media box
     */
    mediaBox?: PdfPageBox;
    /**
     * Bleed box
     */
    bleedBox?: PdfPageBox;
    /**
     * Crop box
     */
    cropBox?: PdfPageBox;
    /**
     * Trim box
     */
    trimBox?: PdfPageBox;
}

/**
 * Margins for a PDF page box
 */
export declare interface PdfPageBoxMargins {
    /**
     * Top margin
     */
    top?: Bleed;
    /**
     * Bottom margin
     */
    bottom?: Bleed;
    /**
     * Left margin
     */
    left?: Bleed;
    /**
     * Right margin
     */
    right?: Bleed;
}

export declare interface PdfRenditionOptions extends RenditionOptions {
    /**
     * PDF rendition format
     */
    format: RenditionFormat.pdf;
    /**
     * Bleed for the page.
     * If bleed is defined, then CropBox and TrimBox will be the size of the express document. BleedBox and MediaBox will be equal to each other,
     * and they will expand on all sides (left, top, right, bottom) with the amount/unit specified by bleed.
     * If undefined, then no bleed (zero).
     */
    bleed?: Bleed;
    /**
     * Exposes ability to customize each PDF Page Box (MediaBox, BleedBox, CropBox, TrimBox) dimensions,
     * by defining how much it should expand on each side beyond the express document page size.
     * If pageBoxes are defined, then PdfRenditionOptions.bleed is ignored.
     */
    pageBoxes?: PdfPageBoxes;
}

/**
 * Denotes the enum for current environment
 */
export declare enum PlatformEnvironment {
    /**
     * App Environment
     */
    app = "app",
    /**
     * Web Environment
     */
    web = "web"
}

/**
 * Denotes the type of platform
 */
export declare enum PlatformType {
    /**
     * iOS
     */
    iOS = "ios",
    /**
     * iPad
     */
    iPadOS = "ipad",
    /**
     * Chrome OS
     */
    chromeOS = "chromeOS",
    /**
     * Android
     */
    android = "android",
    /**
     * Chrome Browser
     */
    chromeBrowser = "chromeBrowser",
    /**
     * Firefox Browser
     */
    firefoxBrowser = "firefoxBrowser",
    /**
     * Edge Browser
     */
    edgeBrowser = "edgeBrowser",
    /**
     * Samsung Browser
     */
    samsungBrowser = "samsumgBrowser",
    /**
     * Safari Browser
     */
    safariBrowser = "safariBrowser",
    /**
     * Unknown Platform
     */
    unknown = "unknown"
}

export declare interface PngRenditionOptions extends RenditionOptions {
    /**
     * PNG rendition format
     */
    format: RenditionFormat.png;
    /**
     * The background color for the image.
     * By default it is derived from the entity for which the rendition needs to be created.
     * Integer in 0xAARRGGBB format
     */
    backgroundColor?: number;
    /**
     * Requested size
     */
    requestedSize?: {
        width?: number;
        height?: number;
    };
}

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
 * Rendition page range
 */
declare enum Range_2 {
    /**
     * Generate rendition for the current page
     */
    currentPage = "currentPage",
    /**
     * Generate rendition for all the pages
     */
    entireDocument = "entireDocument",
    /**
     * Generate rendition for specific pages
     */
    specificPages = "specificPages"
}
export { Range_2 as Range };

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

export declare interface Rendition {
    /**
     * Type of Rendition
     */
    type: RenditionType;
    /**
     * Blob containing the rendition
     */
    blob: Blob;
}

/**
 * Required ouput Format of the rendition
 */
export declare enum RenditionFormat {
    /**
     * PNG format
     */
    png = "image/png",
    /**
     * JPG format
     */
    jpg = "image/jpeg",
    /**
     * MP4 format
     */
    mp4 = "video/mp4",
    /**
     * PDF format
     */
    pdf = "application/pdf"
}

/**
 * Rendition Intent
 */
export declare enum RenditionIntent {
    /**
     * Intent to export/download the content
     */
    export = "export",
    /**
     * Intent to preview the content
     */
    preview = "preview",
    /**
     * Intent to export and print the content
     */
    print = "print"
}

export declare interface RenditionOptions {
    /**
     * Range of the document to get the rendition
     */
    range: Range_2;
    /**
     * Format of the rendition
     */
    format: RenditionFormat;
    /**
     * Ids of the pages (Only required if the range is "specificPages")
     */
    pageIds?: string[];
}

/**
 * Rendition Type
 */
export declare enum RenditionType {
    /**
     * Rendition of the whole page
     */
    page = "page"
}

export declare interface Runtime {
    readonly type: RuntimeType;
    /**
     * If this runtime represents a modal dialog
     * then this object can be used to manage the dialog like closing it and sending results to the invoker etc.
     * will be undefined in the other-cases.
     */
    dialog?: Dialog;

    /**
     * Exposes the concrete object/function of type T,
     * which can be accessed into different runtime part of this AddOn e.g., "document model sandbox" runtime.
     * Note that only concrete objects / class instances are supported. We can't expose entire class
     * from one runtime and create instance of that class in another runtime. Trying to do so will throw an exception.
     * @param apiObj - the concrete object to expose to other runtimes
     *
     * Notes:
     * 1. This method is only present if this UI runtime represents panel UI (not RuntimeType.dialog),
     *    and the add-on has an associated document model sandbox. The sandbox runtime provides similar method to expose APIs in the other direction.
     * 2. This method call is allowed only once. Subsequent calls are ignored.
     */
    exposeApi?<T>(apiObj: T): void;
    /**
     * Requests a promise based proxy object for other runtimes, which will be used
     * by this UI runtime to directly call the APIs exposed (using exposeApi) from the other runtimes.
     * await or .then is necessary, since returned object is a promise.
     * @param runtimeType - the runtime, for which proxy object needs to be created
     * @returns a promise which may resolve to a proxy or reject with rejection reason.
     * The promise resolves to API proxy object exposed by desired runtime, as soon as the other runtime is finished initializing.
     * @see https://github.com/GoogleChromeLabs/comlink/blob/main/src/comlink.ts#L117
     *
     * Note:
     * 1. This method is only present if this UI runtime represents panel UI (not RuntimeType.dialog),
     *    and the add-on has an associated document model sandbox. The sandbox runtime provides similar method to get proxy object in the other direction.
     * 2. Calling the method again for same runtime type will return a new proxy object without any behavior difference.
     */
    apiProxy?<T>(runtimeType: RuntimeType): Promise<Remote<T>>;
}

export declare enum RuntimeType {
    /**
     * Iframe based runtime that usually hosts the add-on main UI logic.
     */
    panel = "panel",
    /**
     * Iframe based runtime that hosts a modal dialog UI
     */
    dialog = "dialog",
    /**
     * @deprecated Use `documentSandbox` instead.
     * Add-On's document model sandbox - JS runtime that hosts add-on code that has direct access to the full model.
     */
    script = "script",
    /**
     * Add-On's document model sandbox - JS runtime that hosts add-on code that has direct access to the full model.
     */
    documentSandbox = "documentSandbox"
}

/**
 * Search Action that can be performed on Editor Panel.
 */
export declare interface SearchAction extends PanelAction {
    /**
     * Search action type.
     */
    type: PanelActionType.search;
    /**
     * Query used to perform search action.
     */
    searchString: string;
}

export declare type SimpleDialogOptions = AlertDialogOptions | InputDialogOptions;

/**
 * Interface that contains methods and properties that are Application UI related.
 */
export declare interface UI {
    /**
     * Current theme of the application
     */
    readonly theme: string;
    /**
     * Current locale of the application
     */
    readonly locale: string;
    /**
     * Current regional format of the application
     */
    readonly format: string;
    /**
     * Supported locales of the application
     */
    readonly locales: string[];
    /**
     * @experimental - Experimental API
     * Opens an Editor Panel
     * @param panel - one of {@link EditorPanel}
     * @param action - optional action to be performed on the panel {@link PanelAction}
     */
    openEditorPanel(panel: EditorPanel, action?: PanelAction): void;
}

declare type UiTheme = "light" | "dark" | "lightest" | "darkest";

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

/**
 * @experimental - Experimental API
 * Callback to unregister iframe from the add-on SDK.
 */
declare type UnregisterIframe = () => void;

/**
 * Types of dialog variants supported.
 */
export declare enum Variant {
    /**
     * Ask a user to confirm an action
     */
    confirmation = "confirmation",
    /**
     * Share information for user to acknowledge
     */
    information = "information",
    /**
     * Share information that a user needs to consider before proceeding
     */
    warning = "warning",
    /**
     * Tell a user that if they proceed with an action, it may impact their data in a negative way
     */
    destructive = "destructive",
    /**
     * Communicate critical issue that a user needs to resolve before proceeding
     */
    error = "error",
    /**
     * Ask a user to provide some inputs
     */
    input = "input",
    /**
     *  A dialog that can render complex forms and content
     */
    custom = "custom"
}

/**
 * Video resolution options for the mp4 renditions
 */
export declare enum VideoResolution {
    /**
     * SD 480p video resolution
     */
    sd480p = "480p",
    /**
     * HD 720p video resolution
     */
    hd720p = "720p",
    /**
     * FHD 1080p video resolution
     */
    fhd1080p = "1080p",
    /**
     * Custom video resolution
     */
    custom = "custom"
}

export {};
