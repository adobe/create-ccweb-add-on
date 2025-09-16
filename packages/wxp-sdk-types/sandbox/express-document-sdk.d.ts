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

import { mat2d } from "gl-matrix";

/**
 * AddOnData class provides APIs to read, write, remove private metadata to a Node.
 * This metadata is accessible only to the add-on that has set it.
 */
export declare class AddOnData {
    /**
     * Sets a private metadata entry on the node.
     * @param key - The key for the private metadata entry.
     * @param value - The value for the private metadata entry.
     */
    setItem(key: string, value: string): void;
    /**
     * Retrieves the private metadata value for the specified key on the node.
     * @param key - The key of the private metadata entry to retrieve.
     * @returns The value of the private metadata entry.
     */
    getItem(key: string): string | undefined;
    /**
     * Removes a single private metadata entry on the node.
     * @param key - The key of the private metadata entry to remove.
     */
    removeItem(key: string): void;
    /**
     * Clears all private metadata entries on the node.
     */
    clear(): void;
    /**
     * @returns an array of all keys for the private metadata entries on the node.
     */
    keys(): string[];
    /**
     * @returns an object with the remaining quota for private metadata on the node for this add-on.
     * The object contains the following properties:
     * - sizeInBytes: The remaining quota size in bytes (maximum 3KB).
     * - numKeys: The remaining quota for the number of keys (maximum 20 keys).
     */
    get remainingQuota(): Readonly<{
        sizeInBytes: number;
        numKeys: number;
    }>;
    /**
     * @returns an iterator for all the private metadata entries on the node.
     * The iterator yields the metadata key-value pairs.
     */
    [Symbol.iterator](): Iterator<[string, string]>;
}

declare namespace ApiConstants {
    export {
        ArrowHeadType,
        BlendMode,
        FillRule,
        FillType,
        SceneNodeType,
        StrokePosition,
        StrokeType,
        TextAlignment,
        TextLayout,
        TextScriptStyle,
        EditorEvent,
        VisualEffectType,
        TextStyleSource,
        ParagraphListType,
        OrderedListNumbering
    };
}

declare interface ApiModuleExport {
    editor: ExpressEditor;
    constants: unknown;
    colorUtils: ExpressColorUtils;
    fonts: ExpressFonts;
    viewport: ExpressViewport;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Area text: both width and height are explicitly set. If text content is too long to fit, the end of the text will be
 * clipped. If text content is short, the frame's bounds will occupy extra height that is just blank space.
 */
export declare interface AreaTextLayout {
    type: TextLayout.area;
    /**
     * The width of the text node in pixels.
     */
    width: number;
    /**
     * The height of the text node in pixels.
     */
    height: number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Additional arrowhead types may be added in the future.* If your code has different branches or cases depending on arrow type,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum ArrowHeadType {
    none = 0,
    triangularFilled = 7,
    openTriangular = 11,
    circleFilled = 21,
    squareFilled = 22,
    circleHollow = 24,
    squareHollow = 25,
    verticalLine = 27
}

/**
 * ArtboardList represents an ordered list of ArtboardNodes, which are the children of one {@link PageNode}. If multiple
 * artboards are present, each represents a keyframe "scene" in the page's animation timeline.
 *
 * ArtboardList also provides APIs for adding/removing artboards from the page. ArtboardList is never empty: it is illegal to
 * remove the last remaining artboard from the list.
 */
export declare class ArtboardList extends RestrictedItemList<ArtboardNode> {
    /**
     * Create a new artboard and add it to the end of the list. The artboard size is the same as others on this page. The
     * artboard background is set to default fill color {@link DEFAULT_ARTBOARD_FILL_COLOR}. The new artboard becomes the
     * default target for newly inserted content (see insertionParent) and the timeline advances to show this artboard
     * in the current viewport.
     * @returns the newly added artboard.
     */
    addArtboard(): ArtboardNode;
}

/**
 * An ArtboardNode represents the topmost container of visual content within a {@link PageNode}. When a page contains
 * multiple artboards, each represents a keyframe "scene" in the page's animation timeline.
 *
 * To create a new artboard, see {@link ArtboardList.addArtboard}.
 */
export declare class ArtboardNode extends VisualNode implements Readonly<IRectangularNode>, ContainerNode {
    /**
     * Returns a read-only list of all children of the node. General-purpose content containers such as ArtboardNode or
     * GroupNode also provide a mutable {@link ContainerNode.children} list. Other nodes with a more specific structure can
     * hold children in various discrete "slots"; this `allChildren` list includes *all* such children and reflects their
     * overall display z-order.
     *
     * The children of an Artboard are all subclasses of Node (not just the more minimal BaseNode or VisualNode).
     */
    get allChildren(): Readonly<Iterable<Node>>;
    /**
     * The artboards's regular children (does not include any "background layer" content if present; use {@link allChildren}
     * for a read-only view that includes background content). Use the methods on this `children` ItemList object to get,
     * add, and remove regular children.
     */
    get children(): ItemList<Node>;
    /**
     * The background fill of the artboard. Artboards must always have a fill.
     *
     */
    set fill(fill: Fill);
    get fill(): Readonly<Fill>;
    /**
     * The node's parent. Undefined if the node is an orphan.
     */
    get parent(): PageNode | undefined;
    /**
     * The width of the artboard.
     * Shares the same dimensions as the parent {@link PageNode} and other artboards within the parent {@link PageNode}.
     * To resize an artboard, resize the parent {@link PageNode}.
     */
    get width(): number;
    /**
     * The height of the artboard.
     * Shares the same dimensions as the parent {@link PageNode} and other artboards within the parent {@link PageNode}.
     * To resize an artboard, resize the parent {@link PageNode}.
     */
    get height(): number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Auto-height text: Width is explicitly set, and text wraps to use as much vertical space as necessary to display the
 * full content.
 */
export declare interface AutoHeightTextLayout {
    type: TextLayout.autoHeight;
    /**
     * The width of the text node in pixels.
     */
    width: number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Auto-width, aka point text: both width and height are automatically determined based on the content. There is no
 * automatic line wrapping, so the text will all be on one line unless the text contains explicit newlines.
 */
export declare interface AutoWidthTextLayout {
    type: TextLayout.autoWidth;
}

/**
 * Font the current user has access or licensing permissions to create / edit content with.
 */
export declare class AvailableFont extends BaseFont {
    /**
     * Whether the font is a premium Adobe font.
     */
    get isPremium(): boolean;
    get availableForEditing(): true;
}

/**
 * Base character styles that can be applied to any range of characters.
 * Excludes font style, which differs between the getter-oriented {@link CharacterStyles} interface and the
 * setter-oriented {@link CharacterStylesInput}.
 */
declare interface BaseCharacterStyles {
    /**
     * Size of the text in points.
     */
    fontSize: number;
    /**
     * Text color.
     */
    color: Color;
    /**
     * Uniformly adjusts the letter spacing, aka character spacing. Specified as a delta relative to the font's default
     * spacing, in units of 1/1000 em: positive values increase the spacing, negative values tighten the spacing, and 0
     * leaves spacing at its default.
     */
    letterSpacing: number;
    /**
     * Adds an underline to text.
     */
    underline: boolean;
    /**
     * A URL hyperlink. Character ranges with a link are underlined *by default*, unless these styles explicitly specify
     * `underline: false`.
     *
     * To remove a link from existing text, explicitly specify `link: ""` in {@link TextContentModel.applyCharacterStyles}.
     */
    link?: string;
    /**
     * Sets a superscript or subscript style.
     */
    baselineShift: TextScriptStyle;
}

/**
 * Represents a font that is able to be rendered within this document. However, the user may not have edit permissions for
 * all such fonts.
 */
declare abstract class BaseFont {
    /**
     * The PostScript name of the font.
     */
    get postscriptName(): string;
    /**
     * The font family containing the font.
     */
    get family(): string;
    /**
     * The style of the font within the family.
     */
    get style(): string;
    /**
     * Whether the current user has permission to create / edit content using this font.
     */
    abstract get availableForEditing(): boolean;
}

/**
 * A "node" represents an object in the scenegraph, the document's visual content tree. This base class includes only the
 * most fundamental nonvisual properties that even nodes near the top of the document structure share (such as PageNode).
 * The more tangible visual content typically extends the richer Node class which extends BaseNode with additional
 * properties.
 */
export declare class BaseNode {
    /**
     * Get {@link AddOnData} reference for managing the private metadata on this node for this add-on.
     */
    get addOnData(): AddOnData;

    /**
     * A unique identifier for this node that stays the same when the file is closed & reopened, or if the node is
     * moved to a different part of the document.
     */
    get id(): string;
    /**
     * Returns a read-only list of all children of the node. General-purpose content containers such as ArtboardNode or
     * GroupNode also provide a mutable {@link ContainerNode.children} list. Other nodes with a more specific structure can
     * hold children in various discrete "slots"; this `allChildren` list includes *all* such children and reflects their
     * overall display z-order.
     *
     * Although BaseNode's allChildren may yield other BaseNodes, the subclasses Node and ArtboardNode override allChildren
     * to guarantee all their children are full-fledged Node instances.
     */
    get allChildren(): Readonly<Iterable<BaseNode>>;
    /**
     * The node's type.
     */
    get type(): SceneNodeType;
    /**
     * The node's parent. The parent chain will eventually reach ExpressRootNode for all nodes that are part of the document
     * content.
     *
     * Nodes that have been deleted are "orphaned," with a parent chain that terminates in `undefined` without reaching the
     * root node. Such nodes cannot be selected, so it is unlikely to encounter one unless you retain a reference to a node
     * that was part of the document content earlier. Deleted nodes can be reattached to the scenegraph, e.g. via Undo.
     */
    get parent(): BaseNode | undefined;
    /**
     * Removes the node from its parent - effectively deleting it, if the node is not re-added to another parent before the
     * document is closed.
     *
     * If parent is a basic ContainerNode, this is equivalent to `node.parent.children.remove(node)`. For nodes with other
     * child "slots," removes the child from whichever slot it resides in, if possible. Throws if the slot does not permit
     * removal. No-op if node is already an orphan.
     */
    removeFromParent(): void;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * BaseParagraphListStyle interface represents common properties shared between ordered and unordered list types.
 */
declare interface BaseParagraphListStyle {
    /** A value from 0-8 that specifies indent/nesting level. Default is 0 if not provided. */
    indentLevel?: number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Base paragraph styles that can be applied to an entire paragraph atomically.
 * Excludes list style settings, which differ between the getter-oriented {@link ParagraphStyles} interface and the
 * setter-oriented {@link ParagraphStylesRangeInput}.
 */
declare interface BaseParagraphStyles {
    /**
     * Space before paragraph (in points). It does not affect the first paragraph. It is additive to previous paragraph's spaceAfter
     * (adjacent spacing does not merge/collapse together).
     */
    spaceBefore: number;
    /**
     * Space after paragraph (in points). It does not affect the last paragraph. It is additive to the next paragraph's spaceBefore
     * (adjacent spacing does not merge/collapse together).
     */
    spaceAfter: number;
    /**
     * Spacing between lines, aka leading, expressed as a multiple of the font size's default spacing - ex. 1.5 = 150% of normal.
     * It only affects the space *between* lines, not the space above the first line or below the last line.
     */
    lineSpacing: number;
}

/**
 * Represents a bitmap image resource. Use {@link Editor.loadBitmapImage} to create a BitmapImage, and then {@link Editor.createImageContainer}
 * to display it in the document by creating a MediaContainerNode structure.
 */
export declare class BitmapImage {
    /**
     * Original width of the bitmap in pixels.
     */
    get width(): number;
    /**
     * Original height of the bitmap in pixels.
     */
    get height(): number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * Determines how a scenenode is composited on top of the content rendered below it.
 *
 * If a node is inside a container whose blend mode anything other than {@link passThrough}, then the node's blend mode only
 * interacts with other siblings within the same container. See documentation below for details.
 */
declare enum BlendMode {
    /**
     * This blend mode only applies to container nodes with children; for leaf nodes, it is treated the same as `normal`.
     *
     * In this mode, the container has no particular blend mode of its own, but rather each individual child of the container
     * will be individually composited onto the background using its own specific blend mode. In *any other* blend mode, the
     * children are first rendered in an "isolation mode" and then the flattened result is composited onto other content
     * below it using solely the container's own blend mode.
     *
     * Group nodes are set to `passThrough` by default.
     */
    passThrough = 1,
    /**
     * The normal, default blend mode for leaf nodes.
     *
     * Note: Group nodes default to using `passThrough` blend mode instead. See below.
     */
    normal = 2,
    multiply = 3,
    darken = 4,
    colorBurn = 5,
    lighten = 6,
    screen = 7,
    colorDodge = 8,
    overlay = 9,
    softLight = 10,
    hardLight = 11,
    difference = 12,
    exclusion = 13,
    hue = 14,
    saturation = 15,
    color = 16,
    luminosity = 17,
    accumulate = 18
}

/**
 * Text styles that can be applied to any range of characters, even a short span like a single word. (Contrast with
 * ParagraphStyles, which must be applied to an entire paragraph atomically).
 */
export declare interface CharacterStyles extends BaseCharacterStyles {
    font: Font;
}

/**
 * Variant of {@link CharacterStyles} with all style fields optional, used for applyCharacterStyles(). When using that API,
 * any fields not specified are left unchanged, preserving the text's existing styles.
 *
 * If specified, the font must be of the {@link AvailableFont} type – one that is guaranteed to be available for the current
 * user to edit with.
 */
export declare interface CharacterStylesInput extends Partial<BaseCharacterStyles> {
    font?: AvailableFont;
}

/**
 * A set of {@link CharacterStyles} along with the range of characters they apply to. Seen in the characterStyleRanges getter.
 *
 * Note that fonts returned by the getter are *not* guaranteed to be ones the user has rights to edit with, even though they
 * are visible in the document.
 */
export declare interface CharacterStylesRange extends CharacterStyles, StyleRange {}

/**
 * Variant of {@link CharacterStylesRange} with all style fields optional, along with the range of characters they apply to.
 * Used for the characterStyleRanges setter. When invoking the setter, any fields not specified are reset to their defaults.
 *
 * If specified, the font must be of the {@link AvailableFont} type – one that is guaranteed to be available for the current
 * user to edit with.
 */
export declare interface CharacterStylesRangeInput extends CharacterStylesInput, StyleRange {}

/**
 * Represents an RGBA color value.
 */
export declare interface Color {
    /**
     * The red channel in range from 0 - 1.
     */
    red: number;
    /**
     * The green channel in range from 0 - 1.
     */
    green: number;
    /**
     * The blue channel in range from 0 - 1.
     */
    blue: number;
    /**
     * The alpha channel in range from 0 - 1.
     */
    alpha: number;
}

/**
 * Represents a solid-color fill.
 *
 * The most convenient way to create a fill is via `Editor.makeColorFill()`.
 */
export declare interface ColorFill extends Fill {
    /**
     * The fill type.
     */
    readonly type: FillType.color;
    /**
     * The fill color.
     */
    color: Color;
}

/**
 * Utility methods for working with color values.
 */
export declare class ColorUtils {
    /**
     * Create a new color object with the given RGBA values.
     * @param red - The red channel, from 0 - 1.
     * @param green - The green channel, from 0 - 1.
     * @param blue - The blue channel, from 0 - 1.
     * @param alpha - Optional alpha channel, from 0 - 1. Defaults to 1 (opaque).
     * @returns A new color object.
     */
    fromRGB(red: number, green: number, blue: number, alpha?: number): Color;
    /**
     * Create a new color object given a partial color object where the alpha field may be missing.
     * @param color - Partial color object. Alpha defaults to 1 (opaque).
     * @returns A new color object with all fields present.
     */
    fromRGB(color: { red: number; green: number; blue: number; alpha?: number }): Color;
    /**
     * Create a new color from its equivalent RGBA hex representation. Can specify in 6 digits (RRGGBB) or 8 digits
     * (RRGGBBAA), uppercase or lowercase, with or without leading "#". Alpha defaults to FF (100% opaque) if ommitted.
     *
     * @param hex - The color represented as a hexadecimal string.
     * @returns A new color value matching the given hex string.
     * @throws if the hex string cannot be parsed.
     */
    fromHex(hex: string): Color;
    /**
     * Get the color in 8-digit hex "#RRGGBBAA" format.
     */
    toHex(color: Color): string;
}

export declare const colorUtils: ExpressColorUtils;

/**
 * A ComplexShapeNode is a complex prepackaged shape that appears as a leaf node in the UI, even if it is composed
 * of multiple separate paths.
 */
export declare class ComplexShapeNode extends FillableNode {}

export declare const constants: typeof ApiConstants;

/**
 * Interface for any node that contains an entirely generic collection of children. Some ContainerNode classes may host
 * *additional* children in other specific "slots," such as background or mask layers; and non-ContainerNode classes may
 * also hold children in specified "slots." Use {@link Node.allChildren} for read access to children regardless of node type.
 *
 * Some ContainerNode classes may be full-fledged Node subclasses (such as Group), while others may be a subclass of the
 * more minimal VisualNode (such as Artboard).
 */
export declare interface ContainerNode extends VisualNode {
    /**
     * The node's children. Use the methods on this ItemList object to get, add, and remove children.
     */
    get children(): ItemList<Node>;
}

/**
 * Contains the user's current selection state, indicating the content they are focused on.
 */
export declare class Context {
    /**
     * Registers a handler for editor events such as selection change.
     * The registered callback will be invoked when the specified event occurs.
     * Note: Do not attempt to make changes to the document in response to a selection change callback because it may destabilize the application.
     * @param eventName - an editor event name.
     * @param callback - a callback to be registered for an editor event.
     * @returns a unique ID for the registered event handler.
     */
    on(eventName: EditorEvent, callback: EditorEventHandler): EventHandlerId;
    /**
     * Unregisters handlers for editor events like selection change.
     * @param eventName - an editor event name.
     * @param handlerId - a unique ID returned by `editor.context.on` API.
     * Callback that was previously registered will be removed and will no more be invoked when the event occurs.
     */
    off(eventName: EditorEvent, handlerId: EventHandlerId): void;
    /**
     * @returns the current selection. Nodes that are locked or otherwise non-editable are never included in the regular
     * selection (see {@link selectionIncludingNonEditable} to get any locked nodes the user may have clicked).
     */
    get selection(): readonly Node[];
    /**
     * Sets the current selection to an array of {@link Node}.
     * Accepts a single node as a shortcut for a length-1 array `[node]` or
     * `undefined` as a shortcut for `[]`, which clears the selection.
     *
     * Only node(s) that meet the following criteria can be selected:
     * - Nodes must be within the current artboard (nodes outside the active artboard are filtered out).
     * - A node cannot be selected if its ancestor is also selected (descendants are filtered out).
     * - Locked nodes are filtered out (but will still be included in selectionIncludingNonEditable).
     */
    set selection(nodes: Node | readonly Node[] | undefined);
    /**
     * @returns the current selection *and* any locked nodes the user has attempted to select at the same time. This can
     * happen for example if the user clicks on a locked node or if the user drags a selection marquee that overlaps
     * locked nodes in addition to regular unlocked nodes.
     */
    get selectionIncludingNonEditable(): readonly Node[];
    /**
     * @returns false if the current editable selection does not contain any nodes, otherwise true.
     */
    get hasSelection(): boolean;
    /**
     * @returns the preferred parent to insert newly added content into (i.e., the location content would get inserted if a
     * user were to Paste or use the Shapes panel in the UI). This will vary depending on the user's current selection and
     * other UI state.
     */
    get insertionParent(): ContainerNode;
    /**
     * @returns The currently viewed page.
     * To change the current page, call {@link Viewport.bringIntoView} with an artboard or other content on that page.
     */
    get currentPage(): PageNode;
}

/**
 * Entry point for APIs that read or modify the document's content.
 */
export declare class Editor {
    /**
     * Enqueues a function to be run at a later time when edits to the user's document may be performed. You can always edit
     * the document immediately when invoked in response to your add-on's UI code. However, if you delay to await an
     * asynchronous operation such as {@link loadBitmapImage}, any edits following this pause must be scheduled using
     * queueAsyncEdit(). This ensures the edit is properly tracked for saving and undo.
     *
     * The delay before your edit function is executed is typically just a few milliseconds, so it will appear instantaneous
     * to users. However, note that queueAsyncEdit() will return *before* your function has been run.
     * If you need to trigger any code after the edit has been performed, either include this in the lambda you are enqueuing
     * or await the Promise returned by queueAsyncEdit().
     *
     * Generally, calling any setter or method is treated as an edit; but simple getters may be safely called at any time.
     *
     * Example of typical usage:
     * ```js
     * // Assume insertImage() is called from your UI code, and given a Blob containing image data
     * async function insertImage(blob) {
     *     // This function was invoked from the UI iframe, so we can make any edits we want synchronously here.
     *     // Initially load the bitmap - an async operation
     *     const bitmapImage = await editor.loadBitmapImage(blob);
     *
     *     // Execution doesn't arrive at this line until an async delay, due to the Promise 'await' above
     *
     *     // Further edits need to be queued to run at a safe time
     *     editor.queueAsyncEdit(() => {
     *          // Create scenenode to display the image, and add it to the current artboard
     *          const mediaContainer = editor.createImageContainer(bitmapImage);
     *          editor.context.insertionParent.children.append(mediaContainer);
     *     });
     * }
     * ```
     *
     * @param lambda - a function which edits the document model.
     * @returns a Promise that resolves when the lambda has finished running, or rejects if the lambda throws an error.
     */
    queueAsyncEdit(lambda: () => void): Promise<void>;
    /**
     * @returns a text node with default styles. The text content is initially empty, so the text node will be
     * invisible until its `fullContent` property's `text` is set. Creates auto-width text, so the node's width will
     * automatically adjust to accommodate whatever text is set.
     * @deprecated - Initial text content is always expected so please use `createText(textContent: string): StandaloneTextNode`.
     */
    createText(): StandaloneTextNode;
    /**
     * @param textContent - the initial string to show.
     * @returns a text node with default styles. Creates auto-width text, so the node's width will automatically adjust
     * to accommodate the given text content.
     *
     * Note: the registration point of this text node is not guaranteed to be at the top-left of the bounding box of its
     * insertion parent. Recommend using `setPositionInParent` over `translation` to set the position.
     */
    createText(textContent: string): StandaloneTextNode;
    /**
     * User's current selection context
     */
    get context(): Context;
    /**
     * @returns the root of the document.
     */
    get documentRoot(): ExpressRootNode;
    /**
     * @returns an ellipse node with default x/y radii, a black fill, and no initial stroke.
     * Transform values default to 0.
     */
    createEllipse(): EllipseNode;
    /**
     * @returns a rectangle node with default width and height, a black fill, and no initial stroke.
     * Transform values default to 0.
     */
    createRectangle(): RectangleNode;
    /**
     * @returns a line node with default start point and end point and a default stroke.
     * Transform values default to 0.
     */
    createLine(): LineNode;
    /**
     * @returns a group node.
     */
    createGroup(): GroupNode;
    /**
     * Convenience helper to create a complete ColorFill value given just its color.
     * @param color - The color to use for the fill.
     */
    makeColorFill(color: Color): ColorFill;
    /**
     * Creates a bitmap image, represented as a multi-node MediaContainerNode structure. Always creates a "full-frame,"
     * uncropped image initially, but cropping can be changed after it is created by modifying the properties of the
     * container's mediaRectangle and maskShape children.
     *
     * Image creation involves some asynchronous steps. The image will be visible in this client almost instantly, but will
     * render as a gray placeholder on other clients until it has been uploaded to DCX and then downloaded by those clients.
     * This local client will act as having unsaved changes until the upload has finished.
     *
     * @param bitmapData - BitmapImage resource (e.g. returned from {@link loadBitmapImage}).
     * @param options - Additional configuration:
     *      - initialSize - Size the image is displayed at. Must have the same aspect ratio as bitmapData. Defaults to the
     *        size the image would be created at by a UI drag-drop gesture (typically the image's full size, but scaled down
     *        if needed to stay below an application-defined size cap).
     * @returns MediaContainerNode representing the top container node of the multi-node structure.
     */
    createImageContainer(
        bitmapData: BitmapImage,
        options?: {
            initialSize?: RectangleGeometry;
        }
    ): MediaContainerNode;
    /**
     * Creates a bitmap image resource in the document, which can be displayed in the scenegraph by passing it to {@link createImageContainer}
     * to create a MediaContainerNode. The same BitmapImage can be used to create multiple MediaContainerNodes.
     *
     * Because the resulting BitmapImage is returned asynchronously, to use it you must schedule an edit lambda to run at a
     * safe later time in order to call {@link createImageContainer}. See {@link queueAsyncEdit}.
     *
     * Further async steps to upload image resource data may continue in the background after this call's Promise resolves,
     * but the resulting BitmapImage can be used right away (via the queue API noted above). The local client will act as
     * having unsaved changes until all the upload steps have finished.
     *
     * @param bitmapData - Encoded image data in PNG or JPEG format.
     */
    loadBitmapImage(bitmapData: Blob): Promise<BitmapImage>;
    /**
     * Convenience helper to create a complete SolidColorStroke value given just a
     * subset of its fields. All other fields are populated with default values.
     *
     * See {@link SolidColorStroke} for more details on the `options` fields. Defaults:
     * - `color` has default value {@link DEFAULT_STROKE_COLOR} if none is provided.
     * - `width` has default value {@link DEFAULT_STROKE_WIDTH} if none is provided.
     * - `position` has default value `center` if none is provided.
     * - `dashPattern` has default value [] if none is provided.
     * - `dashOffset` has default value 0 if none is provided. This field is ignored
     *   if no `dashPattern` was provided.
     * - `type` has default value SolidColorStroke.type if none is provided. This field
     *    shouldn't be set to any other value.
     *
     * @returns a stroke configured with the given options.
     */
    makeStroke(options?: Partial<SolidColorStroke>): SolidColorStroke;
    /**
     * @returns a path node with a default stroke and no initial fill.
     * @param path - a string representing any [SVG path element](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths).
     * Note that the path data will be normalized, and therefore the `path` getter may return a different SVG string from the path creation input.
     * For example, "M 10 80 Q 52.5 10, 95 80 T 180 80" becomes "M 10 80 C 38.33 33.33 66.67 33.33 95 80...".
     * Throws if the input is empty or is not legal SVG path syntax.
     *
     * Note: the visual top-left corner of a path may not be its local (0,0) origin point, so it's easiest to position
     * a newly created path using {@link Node.setPositionInParent} rather than setting {@link Node.translation} directly.
     */
    createPath(path: string): PathNode;
}

export declare const editor: ExpressEditor;

/**
 * This enum represents the supported editor events.
 */
export declare enum EditorEvent {
    selectionChange = "selectionChange"
}

/**
 * This type represents function signature for the editor event handler callback.
 */
export declare type EditorEventHandler = () => void;

/**
 * An EllipseNode represents an ellipse or circle shape in the scenegraph.
 *
 * To create new ellipse, see {@link Editor.createEllipse}.
 */
export declare class EllipseNode extends FillableNode {
    /**
     * The radius of the ellipse on the x-axis.
     */
    get rx(): number;
    /**
     * Set the ellipse radius on the x-axis.
     * Must be at least {@link MIN_DIMENSION} / 2.
     */
    set rx(value: number);
    /**
     * The radius of the ellipse on the y-axis.
     */
    get ry(): number;
    /**
     * Set the ellipse radius on the y-axis.
     * Must be at least {@link MIN_DIMENSION} / 2.
     */
    set ry(value: number);
}

/**
 * This type represents unique id of each event handler callback that is registered.
 */
export declare type EventHandlerId = string;

declare const expressApiModule: ApiModuleExport;
export default expressApiModule;

declare class ExpressColorUtils extends ColorUtils {}

declare class ExpressEditor extends Editor {}

declare class ExpressFonts extends Fonts {}

/**
 * An ExpressRootNode represents the root node of the document's "scenegraph" artwork tree. The root contains a collection
 * of {@link pages}. Each page contains one or more artboards, which in turn hold all the visual content of the document.
 *
 * The parent of ExpressRootNode is undefined, since it is the root of the document tree.
 */
export declare class ExpressRootNode extends BaseNode {
    /**
     * The pages of the document. All visual content is contained on artboards within the pages.
     * To create a new page, see {@link PageList.addPage}.
     */
    get pages(): PageList;
}

declare class ExpressViewport extends Viewport {}

/**
 * Base interface representing any fill in the scenegraph. See {@link FillableNode}.
 * Currently, you can only create {@link ColorFill}s, but you might encounter
 * other fill types when reading scenegraph content.
 */
export declare interface Fill {
    /**
     * The fill type.
     */
    readonly type: FillType;
}

/**
 * Base class for a Node that can have its own fill and stroke.
 */
export declare class FillableNode extends StrokableNode implements IFillableNode {
    /**
     * The fill applied to the shape, if any.
     */
    set fill(fill: Fill | undefined);
    get fill(): Readonly<Fill> | undefined;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * The fill rule, aka "winding rule," specifies how the interior area of a path is determined in cases where the path is
 * self-intersecting or contains separate, nested closed loops.
 */
declare enum FillRule {
    nonZero = 0,
    evenOdd = 1
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal string values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Additional fill types may be added in the future.* If your code has different branches or cases depending on fill type,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum FillType {
    /** A solid color fill. */
    color = "Color"
}

/**
 * Represents a font in the document.
 *
 * Note: not every font encountered in the existing content is available for editing.
 * Check the `availableForEditing` property to be sure.
 */
export declare type Font = AvailableFont | UnavailableFont;

/**
 * The Fonts class provides methods to work with fonts.
 */
export declare class Fonts {
    /**
     * Get an {@link AvailableFont} that exactly matches the given PostScript name, if any. Only fonts that the user has permission to use
     * for editing content are returned, so the result of this call is always safe to apply to a {@link TextContentModel}'s styles.
     *
     * @param postscriptName - The PostScript name of the font.
     * @returns The Font object if found and available for editing, otherwise undefined.
     */
    fromPostscriptName(postscriptName: string): Promise<AvailableFont | undefined>;
}

export declare const fonts: ExpressFonts;

/**
 * A GridCellNode represents the media aspect of a grid cell. Unlike MediaContainerNodes, grid cells cannot be
 * translated or rotated directly and can't modify a mask shape. This implementation translates and rotates the
 * media rectangle child when those actions are applied.
 */
export declare class GridCellNode extends Node implements IMediaContainerNode {
    /**
     * Always throws as it's not possible to clone a single grid slot.
     * Use the parent grid container instead.
     *
     */
    cloneInPlace(): never;
    get allChildren(): Readonly<Iterable<Node>>;
    get mediaRectangle(): ImageRectangleNode | UnknownMediaRectangleNode;
    replaceMedia(media: BitmapImage): void;
    get maskShape(): ReadOnlyMask;
}

/**
 * A GridLayoutNode represents a grid layout in the scenegraph. Currently, grids contain only images but in the future
 * they may support other types of content as well.
 *
 * APIs to create a new grid layout are not yet available.
 */
export declare class GridLayoutNode extends Node implements IRectangularNode {
    /**
     * The GridLayout's child nodes. Nodes are returned in order sorted by the y and then x position of their top left
     * corner, i.e. left to right and top to bottom. These children cannot be added or removed.
     */
    get allChildren(): Readonly<Iterable<GridCellNode>>;
    /**
     * The background fill of the GridLayout. GridLayouts must always have a fill.
     */
    set fill(fill: Fill);
    get fill(): Readonly<Fill>;
    /**
     * The width of the entire GridLayout node.
     * Must be at least {@link MIN_DIMENSION}.
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the entire GridLayout node.
     * Must be at least {@link MIN_DIMENSION}.
     */
    get height(): number;
    set height(value: number);
}

/**
 * A GroupNode represents a Group object in the scenegraph, which has a collection of generic children as well as a separate,
 * optional vector mask child.
 *
 * To create new group, see {@link Editor.createGroup}.
 */
export declare class GroupNode extends Node implements ContainerNode {
    /**
     * The Group's regular children. Does not include the {@link maskShape} if one is present.
     * Use the methods on this ItemList object to get, add, and remove regular children.
     */
    get children(): ItemList<Node>;
    /**
     * A vector shape that acts as a clipping mask for the content of this group. The mask node is separate from the Group's
     * generic 'children' collection, though both are part of the overall 'allChildren' of this Group.
     * @returns undefined if no mask is set on this group.
     */
    get maskShape(): FillableNode | undefined;
    /**
     * If set to a vector shape, adds a mask or replaces the existing mask on this Group.
     * If set to undefined, removes any mask that was previously set on this Group.
     * @throws if the given node type cannot be used as a vector mask.
     */
    set maskShape(mask: FillableNode | undefined);
    /**
     * {@inheritDoc VisualNode.boundsLocal}
     *
     * @returns
     * Note: If this group has a maskShape, group's bounds are always identical to the maskShape's, regardless of the
     * group's other content.
     */
    get boundsLocal(): Readonly<Rect>;
}

/**
 * Interface for {@link FillableNode} *and* any other nodes with a similar `fill` property that do not directly inherit from
 * the FillableNode class.
 */
declare interface IFillableNode {
    fill: Fill | undefined;
}

/**
 * ImageRectangleNode is a rectangular node that displays the image media part of a {@link MediaContainerNode}. It can only
 * exist within that container parent. Cropping can be adjusted by changing this rectangle's position/rotation (as well as
 * its maskShape sibling node).
 *
 * ImageRectangleNodes cannot be created directly; use {@link Editor.createImageContainer} to create the entire
 * container structure together.
 */
export declare class ImageRectangleNode extends MediaRectangleNode {}

/**
 * Interface for nodes that contain media.
 */
export declare interface IMediaContainerNode {
    /**
     * The rectangular node representing the entire, uncropped bounds of the media (e.g. image, GIFs, or video). The media's position and
     * rotation can be changed, but it cannot be resized yet via this API. Media types other than images will yield an UnknownMediaRectangleNode
     * object for now.
     * @privateRemarks
     * Future: for resizing, see HZ-17885 & HZ-12247; for other media types, see HZ-15896.
     */
    get mediaRectangle(): ImageRectangleNode | UnknownMediaRectangleNode;
    /**
     * Replace existing media inline. The new media is sized to completely fill the bounds of the existing maskShape; if the
     * media's aspect ratio differs from the maskShape's, the media will be cropped by the maskShape on either the left/right
     * or top/bottom edges. Currently only supports images as the new media, but previous media can be of any type.
     *
     * @param media - New content to display. Currently must be a {@link BitmapImage}.
     */
    replaceMedia(media: BitmapImage): void;
    /**
     * A read-only view of the mask shape used for cropping/clipping the media.
     */
    get maskShape(): INodeBounds;
}

/**
 * An interface for the bounds of a {@link Node}.
 */
export declare interface INodeBounds extends IVisualNodeBounds {
    /**
     * An axis-aligned box in the parent’s coordinate space encompassing the node’s layout bounds (its
     * {@link boundsLocal}, as transformed by its position and rotation relative to the parent). If the node has
     * rotation, the top-left of its boundsLocal box (aligned to its own axes) is not necessarily located at the
     * top-left of the boundsInParent box (since it's aligned to the parent's axes). This value is well-defined
     * even for an orphan node with no parent.
     */
    get boundsInParent(): Readonly<Rect>;
    /**
     * The translation of the node along its parent's axes. This is identical to the translation component of
     * `transformMatrix`. It is often simpler to set a node's position using `setPositionInParent` than by
     * setting translation directly.
     */
    get translation(): Readonly<Point>;
    /**
     * The node's local rotation angle in degrees, relative to its parent's axes. Use `setRotationInParent` to
     * change rotation by rotating around a defined centerpoint.
     */
    get rotation(): number;
    /**
     * The node's total rotation angle in degrees, relative to the overall global view of the document – including any
     * cumulative rotation from the node's parent containers.
     */
    get rotationInScreen(): number;
    /**
     * The node's transform matrix relative to its parent.
     */
    get transformMatrix(): mat2d;
    /**
     * Convert the node's {@link boundsLocal} to an axis-aligned bounding box in the coordinate space of the target
     * node. Both nodes must share the same {@link visualRoot}, but can lie anywhere within that subtree
     * relative to one another (the target node need not be an ancestor of this node, nor vice versa).
     */
    boundsInNode(targetNode: VisualNode): Readonly<Rect>;
}

/**
 * Interface for nodes with width and height properties.
 */
declare interface IRectangularNode {
    width: number;
    height: number;
}

/**
 * Interface for {@link StrokableNode} *and* any other nodes with a similar `stroke` property that do not directly inherit
 * from the StrokableNode class. (See {@link ArtboardNode}, for example).
 */
declare interface IStrokableNode {
    stroke: Stroke | undefined;
}

/**
 * ItemList represents an ordered list of API objects that are all children of the same parent node. It is most
 * frequently encountered as {@link ArtboardNode.children} or {@link GroupNode.children}.
 *
 * ItemList also provides APIs for manipulating the list by adding items to the parent or removing items from the parent.
 *
 * Note that some parent nodes may have additional children that are *not* present in the main `children` ItemList
 * (e.g. {@link GroupNode.maskShape}). Use the read-only {@link Node.allChildren} for a combined view of all children.
 */
export declare class ItemList<T extends ListItem> extends RestrictedItemList<T> {
    /**
     * Add one or more items to the end of the list. The last argument will become the last item in this list. Items are
     * removed from their previous parent, if any – or if an item is already in *this* list, its index is simply changed.
     */
    append(...items: T[]): void;
    /**
     * Remove all items from this list. No-op if list is already empty.
     */
    clear(): void;
    /**
     * Replace `oldItem` with `newItem` in this list. Throws if `oldItem` is not a member of this list.
     * `newItem` is removed from its previous parent, if any – or if it's already in *this* list, its index is simply
     * changed. No-op if both arguments are the same item.
     */
    replace(oldItem: T, newItem: T): void;
    /**
     * Insert `newItem` so it is immediately before `before` in this list: places `newItem` at the index that `before` used
     * to occupy, shifting `before` and all later items to higher indices. `newItem` is removed from its previous parent,
     * if any – or if it's already in *this* list, its index is simply changed. No-op if both arguments are the same item.
     */
    insertBefore(newItem: T, before: T): void;
    /**
     * Insert `newItem` so it is immediately after `after` in this list: places `newItem` at the index one higher than `after`,
     * shifting all later items to higher indices (the index of `after` remains unchanged). `newItem` is removed from its previous parent,
     * if any – or if it's already in *this* list, its index is simply changed. No-op if both arguments are the same item.
     */
    insertAfter(newItem: T, after: T): void;
}

/**
 * An interface for the bounds of a {@link VisualNode}.
 */
export declare interface IVisualNodeBounds {
    /**
     * The bounding box of the node, expressed in the node's local coordinate space (which may be shifted or rotated
     * relative to its parent). Generally matches the selection outline seen in the UI, encompassing the vector path
     * "spine" of the shape as well as its stroke, but excluding effects such as shadows.
     *
     * The top-left corner of the bounding box corresponds to the visual top-left corner of the node, but this value is
     * *not* necessarily (0,0) – this is especially true for Text and Path nodes.
     */
    get boundsLocal(): Readonly<Rect>;
    /**
     * Position of the node's centerpoint in its own local coordinate space, i.e. the center of the boundsLocal box.
     */
    get centerPointLocal(): Readonly<Point>;
    /**
     * Position of the node's top-left corner in its own local coordinate space, equal to (boundsLocal.x,
     * boundsLocal.y). If the node is rotated, this is not the same as the top-left corner of
     * boundsInParent.
     */
    get topLeftLocal(): Readonly<Point>;
    /**
     * Convert a point given in the node’s local coordinate space to a point in the coordinate space of the target node.
     * Both nodes must share the same {@link visualRoot}, but can lie anywhere within that subtree relative to one
     * another (the target node need not be an ancestor of this node, nor vice versa).
     */
    localPointInNode(localPoint: Point, targetNode: VisualNode): Readonly<Point>;
}

/**
 * A LineNode represents a simple vector line in the scenegraph – a single straight-line segment.
 *
 * To create a new line, see {@link Editor.createLine}.
 */
export declare class LineNode extends StrokableNode {
    static readonly DEFAULT_START_X = 0;
    static readonly DEFAULT_START_Y = 0;
    static readonly DEFAULT_END_X = 100;
    static readonly DEFAULT_END_Y = 100;
    /**
     * Set the start and end points of the line in its local coordinate space (which may
     * differ from its parent's coordinate space based on `transformMatrix`, i.e.
     * `rotation` and `translation`). The values passed in may be normalized
     * by this setter, shifting the node's translation and counter-shifting the start/end
     * points. Therefore, the start/end getters may return values different from the values
     * you passed into this setter, even though the line's visual bounds and appearance are
     * the same. Rotation is preserved.
     */
    setEndPoints(startX: number, startY: number, endX: number, endY: number): void;
    /**
     * The start point on the x-axis in the parent's coordinate system. Modify using `setEndPoints()`.
     */
    get startX(): number;
    /**
     * The start point on the y-axis in the parent's coordinate system. Modify using `setEndPoints()`.
     */
    get startY(): number;
    /**
     * The end point on the x-axis in the parent's coordinate system. Modify using `setEndPoints()`.
     */
    get endX(): number;
    /**
     * The end point on the y-axis in the parent's coordinate system. Modify using `setEndPoints()`.
     */
    get endY(): number;
    /**
     * The shape encapsulating the start of a line.
     *
     * Returns {@link ArrowHeadType.none} if there is no stroke on the line.
     */
    get startArrowHeadType(): ArrowHeadType;
    /**
     * The setter sets a default stroke on the line if it did not have one.
     *
     * @throws if the line's stroke is not a SolidColorStroke type.
     * More complex stroke types do not support arrowheads.
     */
    set startArrowHeadType(type: ArrowHeadType);
    /**
     * The shape encapsulating the end of a line.
     *
     * Returns {@link ArrowHeadType.none} if there is no stroke on the line.
     */
    get endArrowHeadType(): ArrowHeadType;
    /**
     * The setter sets a default stroke on the line if it did not have one.
     *
     * @throws if the line's stroke is not a SolidColorStroke type.
     * More complex stroke types do not support arrowheads.
     */
    set endArrowHeadType(type: ArrowHeadType);
}

/**
 * Base interface for any item that can be stored in an {@link ItemList} (typically a {@link Node} type).
 */
export declare interface ListItem {}

/**
 * A MediaContainerNode is a multi-node construct that displays media (such as images or video) with optional cropping and
 * clipping to a shape mask. The underlying media asset is always rectangular, but the final appearance of this node is
 * determined by the maskShape which is not necessarily a rectangle.
 *
 * To create new media container for a bitmap image, see {@link Editor.createImageContainer}. APIs for creating a
 * container with other content, such as videos, are not yet available.
 */
export declare class MediaContainerNode extends Node implements IMediaContainerNode {
    get mediaRectangle(): ImageRectangleNode | UnknownMediaRectangleNode;
    /**
     * The mask used for cropping/clipping the media. The bounds of this shape are entire visible bounds of the container.
     * The shape's geometric properties (position, rotation, size, etc.) can be changed, but it cannot be replaced by a
     * different shape via this API.
     */
    get maskShape(): FillableNode;
    replaceMedia(media: BitmapImage): void;
}

/**
 * MediaRectangleNode is the base class for a rectangular node that represents the *uncropped* media within a
 * {@link MediaContainerNode}. Specific subclasses such as {@link ImageRectangleNode} exist for each media type and
 * may provide additional media-specific APIs. Cropping can be adjusted by changing this rectangle's position/rotation
 * (as well as its maskShape sibling node).
 */
export declare abstract class MediaRectangleNode extends Node implements Readonly<IRectangularNode> {
    /**
     * Get {@link AddOnData} reference for managing private metadata attached to the media resource displayed by this node.
     * The same media resource may be reused in multiple places in the document, and all share the same AddOnData state.
     * Note: This support is not present for PSD/AI assets. An error will be thrown in that case.
     */
    get mediaAddOnData(): AddOnData;
    /**
     * Current width of the "full frame" uncropped media, which may not be fully visible due to cropping/clipping by the
     * enclosing media container's maskShape. This size may be different from the original image/video size in pixels, but
     * will always match its aspect ratio.
     */
    get width(): number;
    /**
     * Current height of the "full frame" uncropped media, which may not be fully visible due to cropping/clipping by the
     * enclosing media container's maskShape. This size may be different from the original image/video size in pixels, but
     * will always match its aspect ratio.
     */
    get height(): number;
    /**
     * Always throws as it's not possible to clone just the media rectangle alone.
     * Clone the entire parent MediaContainerNode instead.
     *
     */
    cloneInPlace(): never;
}

/**
 * A Node represents an object in the scenegraph, the document's visual content tree. Most tangible visual content is a
 * subclass of Node, but note that some abstract top-level structural nodes (such as PageNode) only extend the more
 * minimal VisualNode or BaseNode. As a general rule, if you can click or drag an object with the select/move
 * tool in the UI, then it extends from Node.
 *
 * A Node’s parent is always a {@link VisualNode}, but it might not be another Node (e.g. if the parent is an ArtboardNode).
 */
declare class Node extends VisualNode implements INodeBounds {
    /**
     * Returns a read-only list of all children of the node. General-purpose content containers such as ArtboardNode or
     * GroupNode also provide a mutable {@link ContainerNode.children} list. Other nodes with a more specific structure can
     * hold children in various discrete "slots"; this `allChildren` list includes *all* such children and reflects their
     * overall display z-order.
     *
     * The children of a Node are always other Node classes (never the more minimal BaseNode).
     */
    get allChildren(): Readonly<Iterable<Node>>;
    get boundsInParent(): Readonly<Rect>;
    boundsInNode(targetNode: VisualNode): Readonly<Rect>;
    get translation(): Readonly<Point>;
    set translation(value: Point);
    /**
     * Move the node so the given `localRegistrationPoint` in its local coordinates is placed at the given
     * `parentPoint` in its parent's coordinates (taking into account any rotation on this node, etc.).
     * @param parentPoint - Point in this node's parent's coordinate space to move `localRegistrationPoint` to
     * @param localRegistrationPoint - Point in this node's local coordinate space to align with `parentPoint`
     * @example
     * Center a rectangle within its parent artboard:
     * ```
     * rectangle.setPositionInParent(
     *     { x: artboard.width / 2, y: artboard.height / 2 },
     *     { x: rectangle.width / 2, y: rectangle.height / 2 }
     * );
     * ```
     */
    setPositionInParent(parentPoint: Point, localRegistrationPoint: Point): void;
    get rotation(): number;
    /**
     * Set the node’s rotation angle relative to its parent to exactly the given value, keeping the given point in the
     * node’s local coordinate space at a fixed location within the parent. Disregards any rotation the node may already
     * have had. The angle set here may not be the absolute rotation angle seen on screen, if the parent or other
     * ancestors also have rotation of their own.
     * @param angleInDegrees - Angle in degrees.
     * @param localRotationPoint - Point to rotate around, in node's local coordinates.
     * @example
     * Rotate the rectangle 45 degrees clockwise around its centerpoint:
     * ```
     * rectangle.setRotationInParent(45, rectangle.centerPointLocal);
     * ```
     */
    setRotationInParent(angleInDegrees: number, localRotationPoint: Point): void;
    get rotationInScreen(): number;
    /**
     * The node's opacity, from 0.0 to 1.0
     */
    get opacity(): number;
    set opacity(opacity: number);
    get transformMatrix(): mat2d;
    /**
     * The node's lock/unlock state. Locked nodes are excluded from the selection (see {@link Context.selection}), and
     * cannot be edited by the user in the UI unless they are unlocked first. It is still possible to mutate locked nodes
     * at the model level using these APIs. However, please consider if modifying a locked node would align with user
     * expectations before doing so.
     *
     */
    get locked(): boolean;
    set locked(locked: boolean);
    /**
     * Blend mode determines how a node is composited onto the content below it. The default value is
     * {@link BlendMode.normal} for most nodes, and {@link BlendMode.passThrough} for GroupNodes.
     */
    get blendMode(): BlendMode;
    set blendMode(value: BlendMode);
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Changes the width to the given value by visually *scaling* the entire content larger or smaller on both axes to
     * preserve its existing aspect ratio, keeping its top-left corner ({@link topLeftLocal}) at a fixed location.
     *
     * Scaling changes the size of visual styling elements such as stroke width, corner detailing, and font size.
     * Contrast this to *resizing* operations (such as {@link resizeToFitWithin}), which adjust the bounding box of an
     * element while trying to preserve the existing size of visual detailing such as strokes, corners, and fonts.
     *
     * Rescaling becomes baked into the updated values of fields such as stroke weight, rectangle width, etc. (it is not
     * a separate, persistent scale factor multiplier).
     */
    rescaleProportionalToWidth(width: number): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Changes the height to the given value by visually *scaling* the entire content larger or smaller on both axes to
     * preserve its existing aspect ratio. See {@link rescaleProportionalToWidth} documentation for additional explanation.
     */
    rescaleProportionalToHeight(height: number): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Resizes the node to fit entirely *within* a box of the given dimensions, keeping its top-left corner ({@link topLeftLocal})
     * at a fixed location. Nodes with a fixed aspect ratio may leave unused space on one axis as a result, but nodes
     * with flexible aspect ratio will be resized to the exact box size specified.
     *
     * Resizing attempts to preserve the existing size of visual styling elements such as stroke width, corner detailing,
     * and font size as much as possible. Contrast with *rescaling* (such as {@link rescaleProportionalToWidth}), which
     * always changes the size of visual detailing in exact proportion to the change in overall bounding box size. This
     * API may still produce *some* degree of rescaling if necessary for certain shapes with fixed corner/edge detailing
     * to fit the box better.
     *
     * @see resizeToCover
     */
    resizeToFitWithin(width: number, height: number): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Resizes the node to completely *cover* a box of the given dimensions, keeping its top-left corner ({@link topLeftLocal})
     * at a fixed location. Nodes with a fixed aspect ratio may extend outside the box on one axis as a result, but
     * nodes with flexible aspect ratio will be resized to the exact box size specified. See {@link resizeToFitWithin}
     * documentation for additional explanation.
     *
     * @see resizeToFitWithin
     */
    resizeToCover(width: number, height: number): void;
    /**
     * Creates a copy of this node and its entire subtree of descendants.
     *
     * The node must be attached to a page as the copy will be added as a sibling.
     *
     */
    cloneInPlace(): typeof this;
}
export { Node as Node };

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Numbering types used to display ordered lists: 1, A, a, I, i 01, 001.
 */
export declare enum OrderedListNumbering {
    numeric = 1,
    uppercaseAlpha = 2,
    lowercaseAlpha = 3,
    uppercaseRomanNum = 4,
    lowercaseRomanNum = 5,
    singleZeroPrefixNumeric = 7,
    doubleZeroPrefixNumeric = 8
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * OrderedListStyle represents the style of an ordered list.
 */
export declare type OrderedListStyle = Required<OrderedListStyleInput>;

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Interface for specifying an ordered list style, such as a numbered list.
 */
export declare interface OrderedListStyleInput extends BaseParagraphListStyle {
    type: ParagraphListType.ordered;
    /**
     * The numbering style to use. If undefined, it defaults to a different type depending on the paragraph's indent level.
     * The defaults for increasing indent are: 1, a, i, I, and then they repeat.
     * These markers and the prefix/postfix strings (if any) are displayed using the same font as the start of the
     * paragraph's text content.
     */
    numbering?: OrderedListNumbering;
    /** Additional string to display before each sequence number/letter, e.g. "(" */
    prefix?: string;
    /** Additional string to display after each sequence number/letter, e.g. ")" or "." */
    postfix?: string;
}

/**
 * PageList represents an ordered list of PageNodes, all of which are children of the root node of the document's "scenegraph"
 * artwork tree (see {@link ExpressRootNode}). A page contains one or more artboards, representing "scenes" in a linear timeline
 * sequence. Those artboards, in turn, contain all the visual content of the document.
 *
 * PageList also provides APIs for adding/removing pages from the document. PageList is never empty: it is illegal to
 * remove the last remaining page from the list.
 */
export declare class PageList extends RestrictedItemList<PageNode> {
    /**
     * Create a new page containing a single empty artboard, and add it to the end of the list. The artboard is configured
     * with the same defaults as in {@link ArtboardList.addArtboard}. The page's artboard becomes the default target for
     * newly inserted content ({@link Context.insertionParent}) and the viewport switches to display this artboard.
     * @param geometry - The size of the new page.
     *
     */
    addPage(inputGeometry: RectangleGeometry): PageNode;
}

/**
 * A PageNode represents a page in the document, a child of the root node of the document's "scenegraph" artwork tree
 * (see {@link ExpressRootNode}). A page contains one or more artboards, which in turn contain all the page's visual
 * content. If multiple artboards are present, each represents a keyframe "scene" in the page's animation timeline.
 *
 * To create new pages, see {@link PageList.addPage}.
 */
export declare class PageNode extends BaseNode implements IRectangularNode {
    /**
     * The artboards or "scenes," which hold the page's visual contents. If multiple artboards are present, this list
     * represents an ordered keyframe sequence in the page's animation timeline.
     * To create new artboards, see {@link ArtboardList.addArtboard}.
     */
    get artboards(): ArtboardList;
    /**
     * The width of the node.
     *
     * All Artboards within a page share the same dimensions, so changing this value will also automatically adjust the
     * size of every child {@link ArtboardNode}.
     *
     * Note: changing the page's size does not adjust the size or position of any of visual content inside any child
     * {@link ArtboardNode}. Callers should use their own layout logic to update the content for the new bounds as
     * desired. For example, making the size smaller could result in content being clipped and hard to access if it is
     * not adjusted to be visible again.
     *
     * Must be at least {@link MIN_PAGE_DIMENSION} and no larger than {@link MAX_PAGE_DIMENSION}.
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the node.
     *
     * All Artboards within a page share the same dimensions, so changing this value will also automatically adjust the
     * size of every child {@link ArtboardNode}.
     *
     * Note: changing the page's size does not adjust the size or position of any of visual content inside any child
     * {@link ArtboardNode}. Callers should use their own layout logic to update the content for the new bounds as
     * desired. For example, making the size smaller could result in content being clipped and hard to access if it is
     * not adjusted to be visible again.
     *
     * Must be at least {@link MIN_PAGE_DIMENSION} and no larger than {@link MAX_PAGE_DIMENSION}.
     */
    get height(): number;
    set height(value: number);
    /**
     * The page's name. Displayed as a user-editable label above the current artboard in the UI.
     */
    get name(): string | undefined;
    set name(name: string | undefined);
    /**
     * Clones this page, all artboards within it, and all content within those artboards. The cloned page is the same size
     * as the original. Adds the new page immediately after this one in the pages list. The first artboard in the cloned
     * page becomes the default target for newly inserted content ({@link Context.insertionParent}) and the viewport
     * switches to display this artboard.
     * @returns the cloned page.
     *
     */
    cloneInPlace(): PageNode;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Indicates list type: see {@link UnorderedListStyleInput} and {@link OrderedListStyleInput}.
 */
export declare enum ParagraphListType {
    unordered = 0,
    ordered = 1
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Text styles that must be applied to an entire paragraph atomically. (Contrast with CharacterStyles which can be applied to
 * any range of characters, even a short span like one single word).
 */
export declare interface ParagraphStyles extends BaseParagraphStyles {
    list?: OrderedListStyle | UnorderedListStyle;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * A variant of {@link ParagraphStyles} with all style fields optional, used for applyParagraphStyles(). When using that API,
 * any fields not specified are left unchanged, preserving the text's existing styles.
 */
export declare interface ParagraphStylesInput extends Partial<BaseParagraphStyles> {
    list?: OrderedListStyleInput | UnorderedListStyleInput;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * A set of {@link ParagraphStyles} along with the text range they apply to. Returned by the paragraphStyleRanges getter.
 */
export declare interface ParagraphStylesRange extends ParagraphStyles, StyleRange {}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * A variant of {@link ParagraphStylesRange} with all style fields optional, along with the text range they apply to. Used for the
 * paragraphStyleRanges setter. When invoking the setter, any fields not specified are reset to their defaults.
 *
 * Paragraphs are separated by newline characters (`\n`). Ranges specified here should align with those boundaries.
 */
export declare interface ParagraphStylesRangeInput extends ParagraphStylesInput, StyleRange {}

/**
 * A PathNode represents a generic vector path shape in the scenegraph. Paths cannot be edited through this API
 * yet, only read.
 *
 * To create new paths, see {@link Editor.createPath}.
 *
 * Note: the visual top-left corner of a path may not be its local (0,0) origin point, so it's easiest to position
 * a path using {@link Node.setPositionInParent} rather than setting its {@link Node.translation} directly.
 */
export declare class PathNode extends FillableNode {
    /**
     * The path definition as an SVG string. The path data is read-only and cannot be modified via this API yet.
     * Note that the path data will be normalized, and therefore the `path` getter may return a different SVG string from the path creation input.
     * For example, "M 10 80 Q 52.5 10, 95 80 T 180 80" becomes "M 10 80 C 38.33 33.33 66.67 33.33 95 80...".
     */
    get path(): string;
    /**
     * The fill rule specifies how the interior area of a path is determined in cases where the path is self-intersecting or
     * has multiple disjoint parts. The default value is nonZero.
     */
    get fillRule(): FillRule;
    set fillRule(rule: FillRule);
}

/**
 * Represents a 2D position.
 */
export declare interface Point {
    x: number;
    y: number;
}

/**
 * ReadOnlyItemList represents an ordered list of API objects that are all children of the same parent node.
 *
 * Items in a bare ReadOnlyItemList cannot be added, removed, or reordered. The {@link ItemList} subclass adds more
 * capabilities, and is most frequently encountered as {@link ArtboardNode.children} or {@link GroupNode.children}.
 */
export declare class ReadOnlyItemList<T extends ListItem> {
    /**
     * Number of items in this list.
     */
    get length(): number;
    /**
     * First item in this list, or undefined if list is empty.
     */
    get first(): T | undefined;
    /**
     * Last item in this list, or undefined if list is empty.
     */
    get last(): T | undefined;
    /**
     * Get index of item in list.
     * @returns index number, or -1 if item isn't in this list.
     */
    indexOf(item: T): number;
    /**
     * Returns item at the given index, or undefined if index is out of range.
     * @param index - Zero-based index
     */
    item(index: number): T | undefined;
    /**
     * Iterates over all the items in this list. Mutations that occur mid-iteration are not reflected by the iterator.
     */
    [Symbol.iterator](): Iterator<T>;
    /**
     * All items in the list, as a static array. Mutations that occur later are not reflected in an array returned earlier.
     */
    toArray(): readonly T[];
}

/**
 * A read-only view of a mask shape.
 */
export declare class ReadOnlyMask implements INodeBounds {
    /**
     * The type of {@link ReadOnlyMask}.
     */
    get type(): "ReadOnlyMask";
    get boundsLocal(): Readonly<Rect>;
    get centerPointLocal(): Readonly<Point>;
    get topLeftLocal(): Readonly<Point>;
    localPointInNode(localPoint: Point, targetNode: VisualNode): Readonly<Point>;
    get boundsInParent(): Readonly<Rect>;
    boundsInNode(targetNode: VisualNode): Readonly<Rect>;
    get translation(): Readonly<Point>;
    get rotation(): number;
    get rotationInScreen(): number;
    get transformMatrix(): mat2d;
}

export declare interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export declare interface RectangleGeometry {
    width: number;
    height: number;
}

/**
 * A RectangleNode represents a rectangle shape in the scenegraph.
 *
 * To create a new rectangle, see {@link Editor.createRectangle}.
 */
export declare class RectangleNode extends FillableNode implements IRectangularNode {
    /**
     * The width of the node.
     * Must be at least {@link MIN_DIMENSION}.
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the node.
     * Must be at least {@link MIN_DIMENSION}.
     */
    get height(): number;
    set height(value: number);
    /**
     * The radius of the top left corner, or 0 if the corner is not rounded.
     *
     * @remarks
     * The actual corner radius that is rendered is capped based on the size of the rectangle
     * even if the radius value set here is higher.
     */
    get topLeftRadius(): number;
    set topLeftRadius(value: number);
    /**
     * The radius of the top right corner, or 0 if the corner is not rounded.
     *
     * @remarks
     * The actual corner radius that is rendered is capped based on the size of the rectangle
     * even if the radius value set here is higher.
     */
    get topRightRadius(): number;
    set topRightRadius(value: number);
    /**
     * The radius of the bottom right corner, or 0 if the corner is not rounded.
     *
     * @remarks
     * The actual corner radius that is rendered is capped based on the size of the rectangle
     * even if the radius value set here is higher.
     */
    get bottomRightRadius(): number;
    set bottomRightRadius(value: number);
    /**
     * The radius of the bottom left corner, or 0 if the corner is not rounded.
     *
     * @remarks
     * The actual corner radius that is rendered is capped based on the size of the rectangle
     * even if the radius value set here is higher.
     */
    get bottomLeftRadius(): number;
    set bottomLeftRadius(value: number);
    /**
     * If all corners have the same rounding radius value, returns that value (or 0 if all corners are not rounded).
     * If the corner radii differ, returns undefined.
     */
    getUniformCornerRadius(): number | undefined;
    /**
     * Set all corner radii to the same value. Set to 0 to make the corners non-rounded.
     *
     * @remarks
     * The actual corner radius that is rendered is capped based on the size of the rectangle
     * even if the radius value set here is higher.
     */
    setUniformCornerRadius(radius: number): void;
}

/**
 * Base for ItemLists that restrict how items are added to the list, but freely allow items to be removed and
 * reordered. The {@link ItemList} subclass adds more capabilities, however.
 */
declare class RestrictedItemList<T extends ListItem> extends ReadOnlyItemList<T> {
    /**
     * Remove the items from the list. The items need not be contiguous.
     *
     * @throws If any of the items are not in the list, or if it is illegal to remove any of the items from this parent.
     */
    remove(...items: T[]): void;
    /**
     * Move `item` so it is immediately before `before` in this list: places `item` at the index that `before` used
     * to occupy. Depending on the position in the list `item` originally occupied, some other items in the list may
     * shift to higher or lower indices as a result. No-op if both arguments are the same item.
     *
     * @throws An error if either argument is not contained in this list.
     */
    moveBefore(item: T, before: T): void;
    /**
     * Move `item` so it is immediately after `after` in this list: places `item` at the index one higher than `after`.
     * Depending on the position in the list `item` originally occupied, some other items in the list may shift to higher
     * or lower indices as a result. No-op if both arguments are the same item.
     *
     * @throws An error if either argument is not contained in this list.
     */
    moveAfter(item: T, after: T): void;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal string values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Additional node types may be added in the future.* If your code has different branches or cases depending on node type,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum SceneNodeType {
    line = "Line",
    rectangle = "Rectangle",
    ellipse = "Ellipse",
    path = "Path",
    linkedAsset = "LinkedAsset",
    group = "Group",
    artboard = "ab:Artboard",
    polygon = "artgr:Polygon",
    artworkRoot = "ArtworkRoot",
    /** Type of MediaContainerNode, representing the top-level container of the multi-node construct used to display images or video. */
    mediaContainer = "MediaContainer",
    /** Type of MediaContainerNode's "media rectangle" child when it is holding an image */
    imageRectangle = "ImageRectangle",
    /** Type of MediaContainerNode's "media rectangle" child when it is holding an unknown media type */
    unknownMediaRectangle = "UnknownMediaRectangle",
    /** Type of PageNode */
    page = "Page",
    /** Type of ComplexShapeNode, representing a complex prepackaged shape with fill and stroke, that appears as a leaf node in the UI */
    complexShape = "ComplexShape",
    /** Type of SolidColorShapeNode, representing a solid-color prepackaged shape that appears as a leaf node in the UI */
    solidColorShape = "SolidColorShape",
    /** Type of StrokeShapeNode, representing a stroke-only prepackaged shape that appears as a leaf node in the UI */
    strokeShape = "StrokeShape",
    /** Type of MediaContainerNode which is a child of a GridLayout, representing one of the Grid's cells*/
    gridCell = "GridCell",
    /** Type of GridLayoutNode represents a grid layout in the scenegraph used to create a layout grid that other content can be placed into */
    gridLayout = "GridLayout",
    /** Type of TextNode, representing a non-threaded text or a threaded text frame */
    text = "Text"
}

/**
 * A SolidColorShapeNode is a prepackaged shape with a single color property that appears as a leaf node in the UI, even if it
 * is composed of multiple separate paths.
 */
export declare class SolidColorShapeNode extends Node {
    /**
     * The color of the single color shape.
     */
    get color(): Readonly<Color> | undefined;
    set color(color: Color | undefined);
}

/**
 * Represents a solid-color stroke, with optional dashes.
 *
 * The most convenient way to create a solid-color stroke is via `Editor.makeStroke()`. This also futureproofs
 * your code in case any other required fields are added to the Stroke descriptor in the future.
 */
export declare interface SolidColorStroke extends Stroke {
    /**
     * The stroke type.
     */
    readonly type: StrokeType.color;
    /**
     * The color of a stroke.
     */
    color: Color;
    /**
     * The thickness of a stroke. Must be from {@link MIN_STROKE_WIDTH} to {@link MAX_STROKE_WIDTH}.
     */
    width: number;
    /**
     * If empty, this is a solid stroke.
     * If non-empty, the values alternate between length of a rendered and blank segment,
     * repeated along the length of the stroke. The first value represents the first solid segment.
     * Array must be of even length. Values cannot be negative.
     */
    dashPattern: number[];
    /**
     * Number of pixels the beginning of dash pattern should be offset along the stroke.
     */
    dashOffset: number;
    /**
     * The position of the stroke relative to the outline of the shape.
     */
    position: StrokePosition;
}

/**
 * SolidColorStroke with 'type' property as optional.
 */
export declare type SolidColorStrokeWithOptionalType = Omit<SolidColorStroke, "type"> &
    Partial<Pick<SolidColorStroke, "type">>;

/**
 * A StandaloneTextNode represents text that is displayed *entirely* within one single frame in the scenegraph (in
 * contrast to {@link ThreadedTextNode}, where text may flow across several separate display "frames").
 * The StandaloneTextNode does not directly hold the text content and styles – instead it refers to a {@link TextNodeContentModel}.
 *
 * To create a new StandaloneTextNode, see {@link Editor.createText}.
 */
export declare class StandaloneTextNode extends TextNode {
    get nextTextNode(): undefined;
    get layout(): Readonly<AutoWidthTextLayout | AutoHeightTextLayout | UnsupportedTextLayout>;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Sets the layout mode of this TextNode "frame" which the text content is displayed within.
     * {@link AreaTextLayout} is not supported by standalone text.
     *
     * @throws if changing text layout to/from {@link TextLayout.magicFit} or {@link TextLayout.circular}
     * layout when the text contains fonts that are unavailable to the current user, because these layouts change
     * capitalization and thus alter which glyphs are displayed.
     */
    set layout(layout: AutoWidthTextLayout | AutoHeightTextLayout);
}

/**
 * Base class for a Node that can have its own stroke.
 */
export declare class StrokableNode extends Node implements IStrokableNode {
    /**
     * The stroke applied to the shape, if any.
     * Only {@link SolidColorStroke} values are supported by the setter, but the "type" field is optional
     * for backward compatibility. Throws if another type is provided.
     */
    set stroke(stroke: SolidColorStrokeWithOptionalType | undefined);
    get stroke(): Readonly<Stroke> | undefined;
}

/**
 * Base interface representing any stroke in the scenegraph. See {@link StrokableNode}.
 * Currently, you can only create {@link SolidColorStroke}s, but you might encounter
 * other stroke types when reading from scenegraph content.
 */
export declare interface Stroke {
    readonly type: StrokeType;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * A stroke's {@link Stroke.position} determines how the thickness of the stroke is aligned along a shape's path outline.
 */
declare enum StrokePosition {
    center = 0,
    inside = 1,
    outside = 2
}

/**
 * A StrokeShapeNode is prepackaged shape that has a single stroke property and appears as a leaf node in the UI, even
 * if it is composed of multiple separate paths.
 */
export declare class StrokeShapeNode extends StrokableNode {}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal string values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Additional stroke types may be added in the future.* If your code has different branches or cases depending on stroke type,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum StrokeType {
    /**
     * A solid-color stroke, with optional dashes.
     */
    color = "Color"
}

/**
 * Represents a range of characters defined by a length (and implicitly started at the end of the previous range).
 */
declare interface StyleRange {
    /**
     * The length or number of characters in which character styles will be applied.
     * Note: since characters are represented as UTF-16 code units, some symbols
     * such as emojis are considered to have a length of 2.
     */
    length: number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Additional alignment types may be added in the future.* If your code has different branches or cases depending on text alignment,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum TextAlignment {
    left = 1,
    right = 2,
    center = 3,
    justifyLeft = 4
}

/**
 * TextContentModel is an abstract base class representing a complete piece of text content.
 * Use this model to get or modify the text string and the style ranges applied to it.
 */
export declare abstract class TextContentModel {
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * A unique identifier for this node that stays the same when the file is closed & reopened, or if the node is
     * moved to a different part of the document.
     *
     * To determine if two TextNodes are connected to the same TextContentModel,
     * check if both models have the same id.
     * Comparing two models using `===` will always fail.
     */
    get id(): string;
    /**
     * The complete text string, which may span multiple {@link ThreadedTextNode} "frames" in the scenegraph.
     * @throws The setter throws if the existing text contains fonts unavailable to the current user.
     * See {@link hasUnavailableFonts}.
     */
    get text(): string;
    set text(textContent: string);
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Appends a new text string to the end of the text content.
     *
     * @param newText - The text to append.
     * @throws if the existing text contains fonts unavailable to the current user. See {@link hasUnavailableFonts}.
     */
    appendText(newText: string): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Inserts a new text string into the text content at the specified index.
     *
     * @param newText - The text to insert.
     * @param index - The index at which to insert the new text.
     * @param style - Style to use for the new text: either directly provides a style to use, or indicates which
     *      existing text to match the style of. Default: `beforeInsertionPoint`.
     * @throws if the existing text contains fonts unavailable to the current user. See {@link hasUnavailableFonts}.
     */
    insertText(
        newText: string,
        index: number,
        style?: CharacterStylesInput | TextStyleSource.beforeInsertionPoint | TextStyleSource.afterInsertionPoint
    ): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Replaces a range of text with a new text string.
     *
     * @param newText - The text to replace the range with.
     * @param replaceRange - The range of text to replace.
     * @param style - Style to use for the new text: either directly provides a style to use, or indicates which
     *      existing text to match the style of. Default: `firstReplacedCharacter`.
     * @throws if the existing text contains fonts unavailable to the current user. See {@link hasUnavailableFonts}.
     */
    replaceText(
        newText: string,
        replaceRange: TextRange,
        style?:
            | CharacterStylesInput
            | TextStyleSource.beforeInsertionPoint
            | TextStyleSource.afterInsertionPoint
            | TextStyleSource.firstReplacedCharacter
    ): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Deletes a range of text from the content.
     *
     * @param range - The range of text to delete.
     * @throws if the existing text contains fonts unavailable to the current user. See {@link hasUnavailableFonts}.
     */
    deleteText(range: TextRange): void;
    /**
     * The character styles that are applied to different ranges of this text content. Each range starts immediately after
     * the previous one: they are always contiguous, and never overlap.
     *
     * When *setting* character styles, any style properties that are not provided are reset to their defaults (contrast to
     * {@link applyCharacterStyles} which preserves the text's existing styles for any fields not specified). If the ranges
     * do not cover the full length of the text, the last range is extended to cover all the remaining text.
     * When *getting* styles, all fields are always provided.
     *
     * Note: existing fonts used in the document, returned by this getter, are not guaranteed to be ones the current user
     * has rights to edit with. The *setter* only accepts the AvailableFont type which has been verified to be usable.
     */
    get characterStyleRanges(): readonly CharacterStylesRange[];
    set characterStyleRanges(styles: readonly CharacterStylesRangeInput[]);
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * The styles applied to different paragraphs of this text content.
     */
    get paragraphStyleRanges(): readonly ParagraphStylesRange[];
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Apply styles to different paragraphs of this text content. Any style properties that are not provided are reset to their defaults.
     * When **getting** styles, all properties are always provided.
     *
     * Paragraphs are separated by newline characters (`\n`). The ranges specified here should align with
     * those boundaries. If multiple ranges provided overlap a single paragraph, the first one to overlap is applied to the
     * entire paragraph.
     *
     * @throws if applying an ordered-list style when the text contains fonts that are unavailable to the current user.
     */
    set paragraphStyleRanges(styles: readonly ParagraphStylesRangeInput[]);
    /**
     * Apply one or more styles to the characters in the given range, leaving any style properties that were not specified
     * unchanged. Does not modify any styles in the text outside this range. Contrast to the {@link characterStyleRanges}
     * setter, which specifies new style range(s) for the entire text at once, and resets any unspecified properties back to
     * default styles.
     *
     * Explicitly specifying `link: undefined` will remove any hyperlinks present in the existing text. If the `link` style
     * property is not specified at all, existing links are preserved.
     *
     * @param styles - The styles to apply.
     * @param range - The start and length of the character sequence to which the styles should be applied.
     * If no range is specified, styles will be applied to the entire text content flow.
     */
    applyCharacterStyles(styles: CharacterStylesInput, range?: TextRange): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Apply one or more styles to the paragraphs in the given range, leaving any style properties that were not specified
     * unchanged. Does not modify any styles in the text outside this range. Contrast to the {@link paragraphStyleRanges}
     * setter, which specifies new style range(s) for the entire text at once, and resets any unspecified properties back to
     * default styles.
     *
     * @param styles - The styles to apply.
     * @param range - The start and length of character sequence to which the styles should be applied. Styles apply to any
     * paragraphs that even partially overlap this range.
     * If range is not specified, the styles will be applied to the entire text content flow.
     *
     * @throws if applying an ordered-list style when the text contains fonts that are unavailable to the current user.
     */
    applyParagraphStyles(styles: ParagraphStylesInput, range?: TextRange): void;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Returns true if this text contains any fonts unavailable to the current user.
     * Currently, if any unavailable fonts are present, the text content cannot be modified and
     * certain styling changes are limited as well. To remove these restrictions, you must modify
     * the character styles to use only AvailableFonts.
     */
    hasUnavailableFonts(): boolean;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 *
 * *Additional text layout types may be added in the future.* If your code has different branches or cases depending on layout type,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum TextLayout {
    /**
     * Area text: both width and height are explicitly set. If text content is too long to fit, the end of the text will be
     * clipped. If text content is short, the frame's bounds will occupy extra height that is just blank space.
     */
    area = 1,
    /**
     * Auto-height text: Width is explicitly set, and text wraps to use as much vertical space as necessary to display the
     * full content.
     */
    autoHeight = 2,
    /**
     * Auto-width, aka point text: both width and height are automatically determined based on the content. There is no
     * automatic line wrapping, so the text will all be on one line unless the text contains explicit newlines.
     */
    autoWidth = 3,
    /**
     * Text is arranged in a circle or arc. The API does not yet support setting or reading the details of this layout style.
     */
    circular = 4,
    /**
     * Aka "Dynamic" layout in the UI: text size and styles are automatically varied to create an attractive multi-line layout.
     * The API does not yet support setting or reading the details of this layout style.
     */
    magicFit = 5
}

/**
 * TextNode is an abstract base class representing text displayed in the scenegraph, regardless of whether it's a fully
 * self-contained {@link StandaloneTextNode} or one of multiple {@link ThreadedTextNode} "frames" in a larger flow. The
 * APIs on TextNode and its {@link TextNodeContentModel} allow you to generically work with text without needing to know
 * which subtype you are dealing with.
 *
 * Note: the visual top-left corner of text is not located at its local (0,0) origin point, so it's easiest to position
 * text using {@link Node.setPositionInParent} rather than setting its {@link Node.translation} directly.
 */
export declare abstract class TextNode extends Node {
    /**
     * {@inheritDoc VisualNode.boundsLocal}
     *
     * @returns
     * Note: The bounding box of the orphaned TextNode may be different from the bounding box of the node placed on a
     * page. It is recommended to use this property only when the node is placed on a page.
     *
     * Note: the visual top-left corner of this box is usually not (0,0). Always use `boundsLocal` or {@link topLeftLocal}
     * instead of assuming (0,0).
     *
     */
    get boundsLocal(): Readonly<Rect>;
    /**
     * {@inheritDoc VisualNode.centerPointLocal}
     *
     * @returns
     * Note: The center of the orphaned TextNode may be different from the center of the node placed on a page. It is
     * recommended to use this property only when the node is placed on a page.
     *
     */
    get centerPointLocal(): Readonly<Point>;
    /**
     * {@inheritDoc VisualNode.topLeftLocal}
     *
     * @returns
     * Note: The top-left of the orphaned TextNode may be different from the top-left of the node placed on a
     * page. It is recommended to use this property only when the node is placed on a page.
     *
     * Note: this value is usually not (0,0) due to the way text layout is defined.
     *
     */
    get topLeftLocal(): Readonly<Point>;
    /**
     * {@inheritDoc Node.boundsInParent}
     *
     * @returns
     * Note: The bounding box of an orphaned TextNode may become different after it is placed on a
     * page. It is recommended to use this property only when the node is placed on a page.
     */
    get boundsInParent(): Readonly<Rect>;
    /**
     * {@inheritDoc Node.boundsInNode}
     *
     * @returns
     * Note: The bounding box of an orphaned TextNode may become different after it is placed on a
     * page. It is recommended to use this method only when the node is placed on a page.
     */
    boundsInNode(targetNode: VisualNode): Readonly<Rect>;
    /**
     * The model containing the complete text string and its styles, only part of which may be visible within the bounds of
     * this specific TextNode "frame." The full text content flow may be split across multiple frames, and/or it may be clipped if a
     * fixed-size frame using {@link AreaTextLayout} does not fit all the (remaining) text.
     *
     * Note: When traversing the scenegraph in search of text content, bear in mind that multiple TextNodes may refer to the
     * same single {@link TextNodeContentModel}; this can give the impression that the same text is duplicated multiple times when it is
     * not. Use {@link TextNodeContentModel}.id to determine whether a given piece of text content is unique or if it's already been
     * encountered before.
     *
     */
    get fullContent(): TextNodeContentModel;
    /**
     * Helper method to determine if the text is standalone.
     */
    isStandaloneText(): this is StandaloneTextNode;
    /**
     * Helper method to determine if the text is in a flow.
     */
    isThreadedText(): this is ThreadedTextNode;
    /**
     * The next TextNode that text overflowing this node will spill into, if any. If undefined and this TextNode is fixed size
     * ({@link AreaTextLayout}), any text content that does not fit within this node's area will be clipped.
     *
     * To get *all* TextNodes that the text content may be split across, use `TextNode.fullContent.allTextNodes`.
     */
    abstract get nextTextNode(): ThreadedTextNode | undefined;
    /**
     * The text string content which is partially *or* fully displayed in this TextNode "frame."
     * WARNING: If a piece of text content flows across several TextNodes, *each* TextNode's `text` getter will return
     * the *entire* text content string.
     * @deprecated - Use the text getter on {@link TextNodeContentModel} instead. Access it via `TextNode.fullContent.text`.
     */
    get text(): string;
    /**
     * Sets the text content of the TextNode.
     * WARNING: If a piece of text content flows across several TextNodes,
     * *each* TextNode's `text` setter will sets the *entire* text content string.
     * @deprecated - Use the text setter on {@link TextNodeContentModel} instead. Access it via `TextNode.fullContent.text`.
     */
    set text(textContent: string);
    /**
     * The horizontal text alignment of the TextNode. Alignment is always the same across this node's entire text content.
     */
    get textAlignment(): TextAlignment;
    set textAlignment(alignment: TextAlignment);
    /**
     * @returns The list of visual effects applied to the TextNode.
     */
    get visualEffects(): readonly VisualEffectType[];
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * @returns The layout mode of the TextNode "frame."
     */
    get layout(): Readonly<AutoWidthTextLayout | AutoHeightTextLayout | AreaTextLayout | UnsupportedTextLayout>;
}

/**
 * Represents a complete piece of text content, which may be contained within a single {@link StandaloneTextNode} *or*
 * split across multiple {@link ThreadedTextNode} frames for display.
 * Use this model to get or modify the text string and the style ranges applied to it.
 */
export declare class TextNodeContentModel extends TextContentModel {
    /**
     * Get ordered list of all {@link TextNode}s that display this text content in the scenegraph. This might be a single
     * {@link StandaloneTextNode} *or* a list of one or more {@link ThreadedTextNode}s. In the case of threaded text, the
     * text content starts in the first {@link ThreadedTextNode} "frame", and then flows into the second node once it has
     * filled the first one. The ending of the text content may not be visible at all, if the last "frame" is not large
     * enough to accommodate it.
     *
     * All linked ThreadedTextNodes that share a single TextContentModel must remain together within the same artboard.
     */
    get allTextNodes(): Readonly<Iterable<TextNode>>;
}

/**
 * A range of text in a {@link TextContentModel}, specified in characters.
 */
export declare interface TextRange {
    start: number;
    length: number;
}

/**
 * Represents a text script style.
 */
export declare enum TextScriptStyle {
    /** text appears at the standard baseline */
    none = 0,
    /** text appears above the baseline */
    superscript = 1,
    /** text appears below the baseline */
    subscript = 2
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Indicates which existing text to match the style of when inserting new text or replacing text.
 */
export declare enum TextStyleSource {
    /**
     * Use style of the character just before the insertion point, *unless* that character is not on the same line (same
     * paragraph) in which case falls back to afterInsertionPoint behavior. This generally matches the style a user would
     * get in the UI if they place their cursor at this insertion point.
     */
    beforeInsertionPoint = 0,
    /**
     * Use style of the character just after the insertion point (which is always on the same line/paragraph, since lines end
     * with a `\n` character; an insertion point past this is inserting on the next line). If there is no character after the
     * insertion point, the insertion point is at the end of the text (appending) and the style of the previous character is
     * used instead. This option is useful when *pre*pending to an existing block of text.
     */
    afterInsertionPoint = 1,
    /**
     * When replacing existing text, use the style of the first character in the replaced text. This may feel more
     * predictable to users than the styles on either side of the replaced text. E.g. if replacing a single word one-to-one
     * with a new word, and the replaced word has a style unique to the text on either side of it, one may expect the new
     * text to match that original word's style.
     */
    firstReplacedCharacter = 2
}

/**
 * A ThreadedTextNode represents a text display frame in the scenegraph which is a subset of longer text that flows across
 * multiple such "frames". Because of this, the TextNode does not directly hold the text content and styles –
 * instead it refers to a {@link TextNodeContentModel}, which may be shared across multiple ThreadedTextNode frames.
 *
 * All linked ThreadedTextNodes that share a single TextContentModel must remain together within the same artboard.
 *
 * APIs are not yet available to create multi-frame text flows. To create *non*-threaded text, use {@link Editor.createText}.
 */
export declare class ThreadedTextNode extends TextNode {
    get nextTextNode(): ThreadedTextNode | undefined;
    get layout(): Readonly<AreaTextLayout>;
    /**
     * <InlineAlert slots="text" variant="warning"/>
     *
     * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
     *
     * @experimental
     * Sets the layout mode of this TextNode "frame" which the text content is displayed within.
     * Only {@link AreaTextLayout}, with fully fixed bounds, is currently supported by threaded text.
     */
    set layout(layout: AreaTextLayout);
}

/**
 * Font the current user does not have access or licensing permissions to create / edit content with.
 */
export declare class UnavailableFont extends BaseFont {
    get availableForEditing(): false;
}

/**
 * UnknownMediaRectangleNode is a rectangular node that represents the *uncropped* media within a {@link MediaContainerNode}
 * for cases where the media type is not yet supported by this API. Cropping can still be adjusted by changing this
 * rectangle's position/rotation (as well as its maskShape sibling node).
 */
export declare class UnknownMediaRectangleNode extends MediaRectangleNode {}

/**
 * An UnknownNode is a node with limited support and therefore treated as a leaf node.
 */
export declare class UnknownNode extends Node {}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * UnorderedListStyle represents the style of an unordered list.
 */
export declare type UnorderedListStyle = Required<UnorderedListStyleInput>;

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Interface for specifying an unordered list style, such as a bullet list.
 */
export declare interface UnorderedListStyleInput extends BaseParagraphListStyle {
    type: ParagraphListType.unordered;
    /**
     * Marker symbol to use. If undefined, it defaults to a different symbol depending on the paragraph's indent level.
     * The defaults for increasing indent are: •, ◦, ◼, ◻, and then they repeat.
     * Markers are always displayed using the default font (SourceSans3 Regular), regardless of the font(s) used in the
     * paragraph's text content. A default marker is used instead if the default font does not support the symbol.
     *
     * Text or Unicode glyphs are accepted to represent the list marker.
     */
    marker?: string;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 *
 * **IMPORTANT:** This is currently ***experimental only*** and should not be used in any add-ons you will be distributing until it has been declared stable. To use it, you will first need to set the `experimentalApis` flag to `true` in the [`requirements`](../../../manifest/index.md#requirements) section of the `manifest.json`.
 *
 * @experimental
 * Represents a text layout the API does not yet support setting or reading the details of.
 */
export declare interface UnsupportedTextLayout {
    type: TextLayout.magicFit | TextLayout.circular;
}

/**
 * Represents the area of the canvas that is currently visible on-screen.
 */
export declare class Viewport {
    /**
     * Adjusts the viewport to make the node's bounds visible on-screen, assuming all bounds are within the artboard bounds.
     * Makes the node's {@link ArtboardNode} or {@link PageNode} visible if they were not already visible
     * (which may result in {@link Context.selection} being cleared). It is strongly recommended
     * to further draw user's attention to the node, set it as the {@link Context.selection} following this call.
     *
     * After this call, the value of {@link Context.insertionParent} will always be the node containing {@link ArtboardNode}.
     *
     * Note that the node might still not appear visible if:
     *   - Its animation settings make it invisible at the beginning of the {@link ArtboardNode} "scene".
     *   - It is obscured underneath other artwork in the z-order.
     *   - It is hidden by a {@link GroupNode}'s mask or similar cropping.
     */
    bringIntoView(node: VisualNode): void;
}

export declare const viewport: ExpressViewport;

/**
 * Visual effects that can be applied to a text node.
 */
declare enum VisualEffectType {
    generativeTextEffects = "GenerativeTextEffects",
    outline = "Outline",
    shadow = "Shadow",
    shapeDecoration = "ShapeDecoration"
}

/**
 * A "node" represents an object in the scenegraph, the document's visual content tree. This class represents any node
 * that can be visually perceived in the content. Most visual content is a subclass of the richer Node class which extends
 * VisualNode with more properties, but the overall ArtboardNode container only supports the VisualNode APIs
 * (and higher-level more abstract containers like PageNode extend only the minimal BaseNode class).
 *
 * Some VisualNodes might have a non-visual parent such as a PageNode.
 */
export declare class VisualNode extends BaseNode implements IVisualNodeBounds {
    /**
     * The highest ancestor that still has visual presence in the document. Typically an Artboard, but for orphaned
     * content, it will be the root of the deleted content (which might be this node itself).
     *
     * Nodes that are both in the same visualRoot subtree lie within the same "visual space" of the document's
     * structure. Nodes that are in different visual roots have no spatial relation to one another; there is no
     * meaningful comparison or conversion between the bounds or coordinate spaces of such nodes.
     */
    get visualRoot(): VisualNode;
    get boundsLocal(): Readonly<Rect>;
    get centerPointLocal(): Readonly<Point>;
    get topLeftLocal(): Readonly<Point>;
    localPointInNode(localPoint: Point, targetNode: VisualNode): Readonly<Point>;
}

export {};
