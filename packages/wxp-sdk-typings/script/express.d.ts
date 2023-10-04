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

declare namespace ApiConstants {
    export {
        SceneNodeTypeValueID,
        BlendModeValue,
        FillTypeValue,
        ArrowHeadType,
        TextAlignmentValue,
        FillRuleValue,
        StrokePositionValue
    };
}

declare interface ApiModuleExport {
    editor: ExpressEditor;
    utils: ApiUtils;
    Constants: unknown;
}

declare interface ApiUtils {
    /**
     * Create a new Color. All color components should be in a 0 - 1 range.
     *
     * @param red - The red component in a range from 0 - 1.
     * @param green - The green component in a range from 0 - 1.
     * @param blue - The blue component in a range from 0 - 1.
     * @param alpha - (optional) The alpha component in a range from 0 - 1. Defaults to 1 (fully opaque).
     */
    createColor(red: number, green: number, blue: number, alpha?: number): Color;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
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
 * ArtboardList represents an ordered list of ArtboardNodes arranged in a timeline sequence, where they are called "scenes."
 * All items in the list are children of a single PageNode.
 *
 * ArtboardList also provides APIs for adding/removing artboards from the page. ArtboardList is never empty: it is illegal to
 * remove the last remaining artboard from the list.
 */
export declare class ArtboardList extends ReadOnlyItemList<ArtboardNode> {
    /**
     * Create a new artboard and add it to the end of the list. The artboard size is the same as others on this page. The
     * artboard background is set to default fill color {@link DEFAULT_ARTBOARD_FILL_COLOR}.
     * @returns the newly added artboard.
     */
    addArtboard(): ArtboardNode;
    /**
     * Remove the items from the list.
     *
     * @throws An error if any of the items are not in the list or if removing the
     * items would cause the list to be empty. If one of these errors occurs, the list
     * is not modified.
     */
    remove(...items: ArtboardNode[]): void;
}

/**
 * An ArtboardNode represents an artboard object in the scenegraph. All user visual content must be contained on an artboard.
 *
 * When multiple artboards exist on a page, the artboards represent "scenes" in a linear timeline sequence.
 */
export declare class ArtboardNode extends ContainerNode implements IRectangularNode, IStrokableNode {
    /**
     * The node's parent. Undefined if the node is an orphan.
     */
    get parent(): PageNode | undefined;
    /**
     * The width of the artboard.
     */
    get width(): number;
    /**
     * The height of the artboard.
     */
    get height(): number;
    /**
     * The background fill of the artboard.
     */
    get fill(): Fill;
    set fill(fill: Fill);
    /**
     * Any strokes(s) on the shape. Use the methods on this ItemList object to get, add, and remove strokes.
     */
    get strokes(): ItemList<Stroke>;
}

/**
 * Represents a bitmap image resource. Can be displayed in the document by creating a MediaContainerNode structure via
 * {@link Editor.createImageContainer}.
 */
export declare interface BitmapImage {
    /**
     * Original width of the bitmap in pixels.
     */
    readonly width: number;
    /**
     * Original height of the bitmap in pixels.
     */
    readonly height: number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * Determines how a scenende is composited on top of the content rendered below it.
 *
 * If a node is inside a container whose blend mode anything other than {@link passThrough}, then the node's blend mode only
 * interacts with other siblings within the same container. See documentation below for details.
 */
declare enum BlendModeValue {
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
    luminosity = 17
}

/**
 * Represents a color in a defined RGB colorspace. Value is immutable – to change, create a new Color object.
 */
export declare class Color {
    /**
     * The red channel in range from 0 - 1.
     */
    get red(): number;
    /**
     * The green channel in range from 0 - 1.
     */
    get green(): number;
    /**
     * The blue channel in range from 0 - 1.
     */
    get blue(): number;
    /**
     * The alpha channel in range from 0 - 1.
     */
    get alpha(): number;
    /**
     * This color's color space. Currently only sRGB is supported.
     */
    get colorSpace(): ColorSpace;
    /**
     * Get the color in 8-digit hex "#RRGGBBAA" format.
     */
    getHex(): string;
}

/**
 * Represents a solid-color fill.
 */
export declare interface ColorFill extends Fill {
    /**
     * The fill type.
     */
    readonly type: FillTypeValue.color;
    /**
     * The fill color.
     */
    readonly color: Color;
}

/**
 * Available color spaces. Currently only sRGB is supported.
 */
export declare enum ColorSpace {
    sRGB = "sRGB"
}

export declare const Constants: typeof ApiConstants;

/**
 * Base class for a Node that contains an entirely generic collection of children. Some ContainerNode subclasses may host
 * *additional* children in other specific "slots," such as background or mask layers; and non-ContainerNode classes may
 * also hold children in specified "slots." Use {@link Node.allChildren} for read access to children regardless of node type.
 */
export declare class ContainerNode extends Node {
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
     * @returns the current selection. Nodes that are locked or otherwise non-editable are never included in the selection.
     */
    get selection(): readonly Node[];
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
     * @returns the preferred parent to insert newly added content into.
     */
    get insertionParent(): ContainerNode;
}

/**
 * Entry point for APIs that read or modify the document's content.
 */
export declare class Editor {
    /**
     * User's current selection context
     */
    get context(): Context;
    /**
     * @returns the root of the document.
     */
    get documentRoot(): ExpressRootNode;
    /**
     * @returns an ellipse node with default x/y radii, and *no* initial stroke or fill.
     * Transform values default to 0.
     */
    createEllipse(): EllipseNode;
    /**
     * @returns a rectangle node with default width and height, and *no* initial stroke or fill.
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
     * @param color - The color to use for the fill.
     * @returns a solid color fill.
     */
    createColorFill(color: Color): ColorFill;
    /**
     * Creates a bitmap image, represented as a multi-node MediaContainerNode structure. Always creates a "full-frame,"
     * uncropped image initially, but cropping can be changed after it is created by modifying the properties of the
     * container's mediaRectangle and maskShape children.
     *
     * Image creation involves some asynchronous steps. The image will be visible in this client almost instantly, but will
     * render as a gray placeholder on other clients until it has been uploaded to storage and then downloaded by those clients.
     * This local client will act as having unsaved changes until the upload has finished.
     *
     * @param bitmapData - BitmapImage resource (e.g. returned from loadBitmapImage()).
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
     * Note: image resources that are unused will be automatically cleaned up after the document is closed.
     *
     * Async steps to upload image resource data continue in the background after this call's Promise resolves, but the BitmapImage
     * return value can be used immediately. The local client will act as having unsaved changes until the upload has finished.
     * @param bitmapData - Encoded image data in PNG or JPEG format.
     */
    loadBitmapImage(bitmapData: Blob): Promise<BitmapImage>;
    /**
     * See {@link StrokeOptions} for more details on the `options` fields. Defaults:
     * - `color` has default value {@link DEFAULT_STROKE_COLOR} if none is provided.
     * - `width` has default value {@link DEFAULT_STROKE_WIDTH} if none is provided.
     * - `dashPattern` has default value [] if none is provided. If the dash pattern has
     *   odd number of elements, the items are copied to double the array. For example,
     *   [1, 2, 3] becomes [1, 2, 3, 1, 2, 3]. Values cannot be negative.
     * - `dashOffset` has default value 0 if none is provided. This options field is ignored
     *   if no `dashPattern` was provided.
     *
     * The stroke's `position` field cannot be specified via options yet because only
     * {@link StrokePositionValue.center} is supported.
     *
     * @returns a stroke configured with the given options.
     */
    createStroke(options?: Partial<StrokeOptions>): Stroke;
    /**
     * @returns a text node with default styles. The text content is initially empty, so the text node will be
     * invisible until its `text` property is set. Creates point text, so the node's width will automatically
     * adjust to accommodate whatever text is set.
     */
    createText(): TextNode;
}

export declare const editor: ExpressEditor;

/**
 * An EllipseNode represents an ellipse object in the scenegraph.
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

declare const expressApiModule: ApiModuleExport;
export default expressApiModule;

declare class ExpressEditor extends Editor {}

/**
 * An ExpressRootNode represents the root node of the document's "scenegraph" artwork tree.
 */
export declare class ExpressRootNode extends Node {
    /**
     * The pages of the document. All visual content is contained on artboards within the pages.
     */
    get pages(): PageList;
}

/**
 * Base interface representing any fill in the scenegraph. See {@link FillableNode}.
 */
export declare interface Fill {
    /**
     * The fill type.
     */
    readonly type: FillTypeValue;
}

/**
 * Base class for a Node that can have its own fill and stroke.
 */
export declare class FillableNode extends StrokableNode implements IFillableNode {
    /**
     * Any fill(s) on the shape. Use the methods on this ItemList object to get, add, and remove fills.
     */
    get fills(): ItemList<Fill>;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 */
declare enum FillRuleValue {
    nonZero = 0,
    evenOdd = 1
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 * *Do not depend on the literal string values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 * *Additional fill types may be added in the future.* If your code has different branches or cases depending on fill type,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum FillTypeValue {
    /** A solid color fill. */
    color = "Color"
}

/**
 * A GroupNode represents a Group object in the scenegraph, which has a collection of generic children as well as a separate,
 * optional vector mask child.
 */
export declare class GroupNode extends ContainerNode {
    /**
     * The Group's regular children. Does not include the maskShape if one is present.
     * Use the methods on this ItemList object to get, add, and remove children.
     */
    get children(): ItemList<Node>;
    /**
     * A vector shape that acts as a clipping mask for the content of this group. The mask node is separate from the Group's
     * generic 'children' collection, though both are part of the overall 'allChildren' of this Group.
     * @returns undefined if no mask is set on this group.
     */
    get maskShape(): FillableNode | undefined;
    /**
     * If set to a vector shape, adds a mask or replaces the exsiting mask on this Group.
     * If set to undefined, removes any mask that was previously set on this Group.
     * @throws if the given node type cannot be used as a vector mask.
     */
    set maskShape(mask: FillableNode | undefined);
}

/**
 * Interface for {@link FillableNode} *and* any other nodes with a similar `fills` API that do not directly inherit from the
 * FillableNode class.
 */
declare interface IFillableNode {
    fills: ItemList<Fill>;
}

/**
 * ImageRectangleNode is a rectangular node that displays the image media part of a MediaContainerNode. It can only exist
 * within that container parent. Cropping can be adjusted by changing this media's position/rotation (as well as its mask
 * shape sibling node).
 */
export declare class ImageRectangleNode extends Node implements Readonly<IRectangularNode> {
    /**
     * Current width of the "full frame" image rectangle, which may not be fully visible due to cropping/clipping by the
     * enclosing media container's maskShape. This size may be different from the original bitmap's size in pixels, but
     * will always match its aspect ratio.
     */
    get width(): number;
    /**
     * Current height of the "full frame" image rectangle, which may not be fully visible due to cropping/clipping by the
     * enclosing media container's maskShape. This size may be different from the original bitmap's size in pixels, but
     * will always match its aspect ratio.
     */
    get height(): number;
}

/**
 * Interface for nodes with width and height properties.
 */
declare interface IRectangularNode {
    width: number;
    height: number;
}

/**
 * Interface for {@link StrokableNode} *and* any other nodes with a similar `strokes` API that do not directly inherit from
 * the StrokableNode class. (See {@link ArtboardNode}, for example).
 */
declare interface IStrokableNode {
    strokes: ItemList<Stroke>;
}

/**
 * ItemList represents an ordered list of API objects, representing items that are all children of the
 * same parent node. (The reverse is not necessarily true, however: this list might not include all
 * children that exist in the parent node. See {@link Node.allChildren} for details).
 *
 * ItemList also provides APIs for manipulating the list by adding items to the parent or removing items from the parent.
 *
 * This class is used in different places for various types of items, including Nodes, Fills, and Strokes.
 */
export declare class ItemList<T extends ListItem> extends ReadOnlyItemList<T> {
    /**
     * Add one or more items to the end of the list. The last argument will become the last item in this list. Items are
     * removed from their previous parent, if any – or if an item is already in *this* list, its index is simply changed.
     */
    append(...items: T[]): void;
    /**
     * Remove one or more items from this list. The items need not be contiguous.
     * Throws without performing any removals if any item is not a member of this list.
     */
    remove(...items: T[]): void;
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
 * A LineNode represents a simple line object in the scenegraph – a single straight-line segment.
 */
export declare class LineNode extends StrokableNode {
    static readonly DEFAULT_START_X = 0;
    static readonly DEFAULT_START_Y = 0;
    static readonly DEFAULT_END_X = 100;
    static readonly DEFAULT_END_Y = 100;
    /**
     * Set the start and end points of the line in its local coordinate space (which may
     * differ from its parent's coordinate space based on `relativeTransform`, i.e.
     * `relativeRotation` and `translateX`/`Y`). The values passed in may be normalized
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
     * The shape encapsulating the start of a line. The size and color of the arrowhead
     * depends on the first available stroke's weight and color assigned to the node.
     * Removal of all strokes on this line leads to the arrowhead's removal.
     *
     * The getter returns {@link ArrowHeadType.none} when there are no strokes on the line
     * or no arrowhead on the first stroke of the line.
     */
    get startArrowHeadType(): ArrowHeadType;
    /**
     * The setter creates a default stroke for the line when there are no strokes on the line,
     * and updates the arrowhead on only the first stroke of the line.
     */
    set startArrowHeadType(type: ArrowHeadType);
    /**
     * The shape encapsulating the end of a line. The size and color of the arrowhead
     * depends on the first available stroke's weight and color assigned to the node.
     * Removal of all strokes on this line leads to the arrowhead's removal.
     *
     * The getter returns {@link ArrowHeadType.none} when there are no strokes on the line
     * or no arrowhead on the first stroke of the line.
     */
    get endArrowHeadType(): ArrowHeadType;
    /**
     * The setter creates a default stroke for the line when there are no strokes on the line,
     * and updates the arrowhead on only the first stroke of the line.
     */
    set endArrowHeadType(type: ArrowHeadType);
}

/**
 * Base interface for any item that can be used in {@link ItemList}. ItemList is used in different places to hold various
 * types of items, including Nodes, Fills, and Strokes.
 */
export declare interface ListItem {}

/**
 * A MediaContainerNode is a multi-node construct that displays media (such as images or video) with optional cropping and
 * clipping to a shape mask. The underlying media asset is always rectangular, but the final appearance of this node is
 * determined by the maskShape which is not necessarily a rectangle.
 */
export declare class MediaContainerNode extends Node {
    /**
     * The rectangular node representing the entire, uncropped bounds of the media (e.g. image or video). The media's position and
     * rotation can be changed, but it cannot be resized yet via this API. Media types other than images will yield a plain Node object
     * for now.
     */
    get mediaRectangle(): ImageRectangleNode | Node;
    /**
     * The mask used for cropping/clipping the media. The bounds of this shape are entire visible bounds of the container.
     * The shape's geometric properties (position, rotation, size, etc.) can be changed, but it cannot be replaced by a
     * different shape via this API.
     */
    get maskShape(): FillableNode;
}

/**
 * A Node represents an object in the scenegraph, the document's visual content tree.
 */
declare class Node {
    /**
     * Returns a read-only list of all children of the node. General-purpose content containers such as ArtboardNode or
     * GroupNode also provide a mutable {@link ContainerNode.children} list. Other nodes with a more specific structure can
     * hold children in various discrete "slots"; this `allChildren` list includes *all* such children and reflects their
     * overall display z-order.
     */
    get allChildren(): Readonly<Iterable<Node>>;

    /**
     * The node's type.
     */
    get type(): SceneNodeTypeValueID;
    /**
     * The translation of the node along its parent's x-axis.
     */
    get translateX(): number;
    set translateX(value: number);
    /**
     * The translation of the node along its parent's y-axis.
     */
    get translateY(): number;
    set translateY(value: number);
    /**
     * The node's local rotation value in degrees, relative to its parent's axes. Modifying this value will also adjust the
     * node's x & y translation such that the node's center is in the same location after the rotation – i.e. this setter
     * rotates the node about its bounding box's center, not its origin.
     */
    get relativeRotation(): number;
    set relativeRotation(value: number);
    /**
     * The node's absolute (global) rotation angle in degrees – includes any cumulative rotation from the node's parent containers.
     */
    get absoluteRotation(): number;
    set absoluteRotation(value: number);
    /**
     * The node's parent. Undefined if the node is an orphan, or if the node is the artwork root.
     */
    get parent(): Node | undefined;
    /**
     * Removes the node from its parent - for a basic ContainerNode, this is equivalent to `node.parent.children.remove(node)`.
     * For nodes with other slots, removes the child from whichever slot it resides in, if possible. Throws if the slot does
     * not support removal. Also throws if node is the artwork root. No-op if node is already an orphan.
     */
    removeFromParent(): void;
    /**
     * The node's opacity, from 0.0 to 1.0
     */
    get opacity(): number;
    set opacity(opacity: number);
    /**
     * The node's transform matrix relative to its parent.
     */
    get relativeTransform(): mat2d;
    /**
     * The node's absolute (global) transform matrix.
     */
    get absoluteTransform(): mat2d;
    /**
     * The node's lock/unlock state. Locked nodes are excluded from the selection (see {@link Context.selection}), and
     * cannot be edited by the user unless they are unlocked first.
     */
    get locked(): boolean;
    set locked(locked: boolean);
    /**
     * Blend mode determines how a node is composited onto the content below it. The default value is
     * {@link BlendModeValue.normal} for most nodes, and {@link BlendModeValue.passThrough} for GroupNodes.
     */
    get blendMode(): BlendModeValue;
    set blendMode(value: BlendModeValue);
}
export { Node as Node };

/**
 * PageList represents an ordered list of PageNodes, all of which are children of the root node of the document's "scenegraph"
 * artwork tree. A page contains one or more artboards, representing "scenes" in a linear timeline sequence. Those artboards
 * in turn contain all the visual content of the document.
 *
 * PageList also provides APIs for adding/removing pages from the document. PageList is never empty: it is illegal to
 * remove the last remaining page from the list.
 */
export declare class PageList extends ReadOnlyItemList<PageNode> {
    /**
     * Create a new page containing a single empty artboard, and add it to the end of the list. The artboard is configured
     * with the same defaults as in {@link ArtboardList.addArtboard}. The page's artboard becomes the default target for
     * newly inserted content ({@link Context.insertionParent}) and the viewport switches to display this artboard.
     * @param geometry - The size of the new page.
     */
    addPage(geometry: RectangleGeometry): PageNode;
}

/**
 * A PageNode represents a page in the document. A page contains one or more artboards, representing "scenes" in a linear
 * timeline sequence. Those artboards in turn contain all the visual content of the document.
 */
export declare class PageNode extends Node implements Readonly<IRectangularNode> {
    /**
     * The artboards or "scenes" of a page, ordered by timeline sequence.
     */
    get artboards(): ArtboardList;
    /**
     * The width of the node.
     * All Artboards within a page share the same dimensions.
     */
    get width(): number;
    /**
     * The height of the node.
     * All Artboards within a page share the same dimensions.
     */
    get height(): number;
    /**
     * The page's name. Displayed as a user-editable label above the current artboard in the UI.
     */
    get name(): string | undefined;
    set name(name: string | undefined);
}

/**
 * ReadOnlyItemList represents an ordered list of API objects, representing items that are all children of the
 * same parent node. (The reverse is not necessarily true, however: this list might not include all
 * children that exist in the parent node. See {@link Node.allChildren} for details).
 *
 * Items in a bare ReadOnlyItemList cannot be added, removed, or reordered. Subclasses like ItemList may add these capabilities, however.
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
    toArray(): Readonly<T[]>;
}

export declare interface RectangleGeometry {
    width: number;
    height: number;
}

/**
 * A RectangleNode represents a rectangle object in the scenegraph.
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
 * <InlineAlert slots="text" variant="warning"/>
 * *Do not depend on the literal string values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * <InlineAlert slots="text" variant="warning"/>
 * *Additional node types may be added in the future.* If your code has different branches or cases depending on node type,
 * always have a default/fallback case to handle any unknown values you may encounter.
 */
declare enum SceneNodeTypeValueID {
    line = "Line",
    rectangle = "Rectangle",
    ellipse = "Ellipse",
    path = "Path",
    text = "Text",
    linkedAsset = "LinkedAsset",
    group = "Group",
    artboard = "ab:Artboard",
    polygon = "artgr:Polygon",
    artworkRoot = "ArtworkRoot",
    /** Type of MediaContainerNode, representing the top-level container of the multi-node construct used to display images or video. */
    mediaContainer = "MediaContainer",
    /** Type of MediaContainerNode's "media rectangle" child when it is holding an image */
    imageRectangle = "ImageRectangle",
    /** Type of PageNode */
    page = "Page"
}

/**
 * Base class for a Node that can have its own stroke.
 */
export declare class StrokableNode extends Node implements IStrokableNode {
    static DEFAULT_STROKE_WIDTH: number;
    /**
     * Any stroke(s) on the shape. Use the methods on this ItemList object to get, add, and remove strokes.
     */
    get strokes(): ItemList<Stroke>;
}

/**
 * Represents a stroke in the scenegraph. See {@link StrokableNode}.
 */
export declare interface Stroke extends StrokeOptions {
    /**
     * The position of the stroke relative to the outline of the shape.
     */
    readonly position: StrokePositionValue;
}

/**
 * Properties that can be provided to create a stroke.
 */
export declare interface StrokeOptions {
    /**
     * The color of a stroke.
     */
    readonly color: Color;
    /**
     * The thickness of a stroke. Must be from {@link MIN_STROKE_WIDTH} to {@link MAX_STROKE_WIDTH}.
     */
    readonly width: number;
    /**
     * If empty, this is a solid stroke.
     * If non-empty, the values alternate between length of a rendered and blank segment,
     * repeated along the length of the stroke. The first value represents the first solid segment.
     */
    readonly dashPattern: number[];
    /**
     * Number of pixels the beginning of dash pattern should be offset along the stroke.
     */
    readonly dashOffset: number;
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 *
 * A stroke's {@link Stroke.position} determines how the thickness of the stroke is aligned along a shape's path outline.
 */
declare enum StrokePositionValue {
    center = 0,
    inside = 1,
    outside = 2
}

/**
 * <InlineAlert slots="text" variant="warning"/>
 * *Do not depend on the literal numeric values of these constants*, as they may change. Always reference the enum identifiers in your code.
 */
declare enum TextAlignmentValue {
    left = 1,
    right = 2,
    center = 3
}

/**
 * A TextNode represents a text object in the scenegraph.
 */
export declare class TextNode extends Node {
    /**
     * The text string of the node
     */
    get text(): string;
    set text(textContent: string);
    /**
     * The horizontal text alignment of the text node. Alignment is always the same across this node's entire text content.
     */
    get textAlignment(): TextAlignmentValue;
    set textAlignment(alignment: TextAlignmentValue);
}

export declare const utils: ApiUtils;

export {};
