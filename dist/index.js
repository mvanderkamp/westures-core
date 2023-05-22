/**
 * The global API interface for westures-core. Exposes all classes, constants,
 * and routines used by the package. Use responsibly.
 *
 * @namespace westures-core
 */ "use strict";
var $de0d6a332419bf3c$exports = {};
"use strict";
let $de0d6a332419bf3c$var$g_id = 0;
/**
 * The Gesture class that all gestures inherit from. A custom gesture class will
 * need to override some or all of the four phase "hooks": start, move, end, and
 * cancel.
 *
 * @memberof westures-core
 *
 * @param {string} type - The name of the gesture.
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 *    is recognized on the associated element.
 * @param {object} [options] - Generic gesture options
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 */ class $de0d6a332419bf3c$var$Gesture {
    constructor(type, element, handler, options = {}){
        if (typeof type !== "string") throw new TypeError("Gestures require a string type / name");
        /**
     * The name of the gesture. (e.g. 'pan' or 'tap' or 'pinch').
     *
     * @type {string}
     */ this.type = type;
        /**
     * The unique identifier for each gesture. This allows for distinctions
     * across instances of Gestures that are created on the fly (e.g.
     * gesture-tap-1, gesture-tap-2).
     *
     * @type {string}
     */ this.id = `gesture-${this.type}-${$de0d6a332419bf3c$var$g_id++}`;
        /**
     * The element to which to associate the gesture.
     *
     * @type {Element}
     */ this.element = element;
        /**
     * The function handler to execute when the gesture is recognized on the
     * associated element.
     *
     * @type {Function}
     */ this.handler = handler;
        /**
     * The options. Can usually be adjusted live, though be careful doing this.
     *
     * @type {object}
     */ this.options = {
            ...$de0d6a332419bf3c$var$Gesture.DEFAULTS,
            ...options
        };
    }
    /**
   * Determines whether this gesture is enabled.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {boolean} true if enabled, false otherwise.
   */ isEnabled(state) {
        const count = state.active.length;
        const event = state.event;
        const { enableKeys: enableKeys , disableKeys: disableKeys , minInputs: minInputs , maxInputs: maxInputs  } = this.options;
        return minInputs <= count && maxInputs >= count && (enableKeys.length === 0 || enableKeys.some((k)=>event[k])) && !disableKeys.some((k)=>event[k]);
    }
    /**
   * Event hook for the start phase of a gesture.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ start() {
        return null;
    }
    /**
   * Event hook for the move phase of a gesture.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ move() {
        return null;
    }
    /**
   * Event hook for the end phase of a gesture.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ end() {
        return null;
    }
    /**
   * Event hook for when an input is cancelled.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ cancel() {
        return null;
    }
    /**
   * Evalutes the given gesture hook, and dispatches any data that is produced
   * by calling [recognize]{@link westures-core.Gesture#recognize}.
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {westures-core.State} state - The current State instance.
   */ evaluateHook(hook, state) {
        const data = this[hook](state);
        if (data) this.recognize(hook, state, data);
    }
    /**
   * Recognize a Gesture by calling the handler. Standardizes the way the
   * handler is called so that classes extending Gesture can circumvent the
   * evaluateHook approach but still provide results that have a common format.
   *
   * Note that the properties in the "data" object will receive priority when
   * constructing the results. This can be used to override standard results
   * such as the phase or the centroid.
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {westures-core.State} state - current input state.
   * @param {Object} data - Results data specific to the recognized gesture.
   */ recognize(hook, state, data) {
        this.handler({
            centroid: state.centroid,
            event: state.event,
            phase: hook,
            type: this.type,
            target: this.element,
            ...data
        });
    }
}
$de0d6a332419bf3c$var$Gesture.DEFAULTS = {
    enableKeys: [],
    disableKeys: [],
    minInputs: 1,
    maxInputs: Number.MAX_VALUE
};
$de0d6a332419bf3c$exports = $de0d6a332419bf3c$var$Gesture;


var $e2125e2e71e37a0c$exports = {};
"use strict";
var $0ca7bfe1c074e8ca$exports = {};
"use strict";
var $6c3676f10a43b740$exports = {};
"use strict";
/**
 * The Point2D class stores and operates on 2-dimensional points, represented as
 * x and y coordinates.
 *
 * @memberof westures-core
 *
 * @param {number} [ x=0 ] - The x coordinate of the point.
 * @param {number} [ y=0 ] - The y coordinate of the point.
 */ class $6c3676f10a43b740$var$Point2D {
    constructor(x = 0, y = 0){
        /**
     * The x coordinate of the point.
     *
     * @type {number}
     */ this.x = x;
        /**
     * The y coordinate of the point.
     *
     * @type {number}
     */ this.y = y;
    }
    /**
   * Calculates the angle between this point and the given point.
   *
   * @param {!westures-core.Point2D} point - Projected point for calculating the
   * angle.
   *
   * @return {number} Radians along the unit circle where the projected
   * point lies.
   */ angleTo(point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }
    /**
   * Determine the angle from the centroid to each of the points.
   *
   * @param {!westures-core.Point2D[]} points - the Point2D objects to calculate
   *    the angles to.
   *
   * @returns {number[]}
   */ anglesTo(points) {
        return points.map((point)=>this.angleTo(point));
    }
    /**
   * Determine the average distance from this point to the provided array of
   * points.
   *
   * @param {!westures-core.Point2D[]} points - the Point2D objects to calculate
   *    the average distance to.
   *
   * @return {number} The average distance from this point to the provided
   *    points.
   */ averageDistanceTo(points) {
        return this.totalDistanceTo(points) / points.length;
    }
    /**
   * Clone this point.
   *
   * @return {westures-core.Point2D} A new Point2D, identical to this point.
   */ clone() {
        return new $6c3676f10a43b740$var$Point2D(this.x, this.y);
    }
    /**
   * Calculates the distance between two points.
   *
   * @param {!westures-core.Point2D} point - Point to which the distance is
   * calculated.
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */ distanceTo(point) {
        return Math.hypot(point.x - this.x, point.y - this.y);
    }
    /**
   * Subtract the given point from this point.
   *
   * @param {!westures-core.Point2D} point - Point to subtract from this point.
   *
   * @return {westures-core.Point2D} A new Point2D, which is the result of (this
   * - point).
   */ minus(point) {
        return new $6c3676f10a43b740$var$Point2D(this.x - point.x, this.y - point.y);
    }
    /**
   * Return the summation of this point to the given point.
   *
   * @param {!westures-core.Point2D} point - Point to add to this point.
   *
   * @return {westures-core.Point2D} A new Point2D, which is the addition of the
   * two points.
   */ plus(point) {
        return new $6c3676f10a43b740$var$Point2D(this.x + point.x, this.y + point.y);
    }
    /**
   * Calculates the total distance from this point to an array of points.
   *
   * @param {!westures-core.Point2D[]} points - The array of Point2D objects to
   *    calculate the total distance to.
   *
   * @return {number} The total distance from this point to the provided points.
   */ totalDistanceTo(points) {
        return points.reduce((d, p)=>d + this.distanceTo(p), 0);
    }
    /**
   * Calculates the centroid of a list of points.
   *
   * @param {westures-core.Point2D[]} points - The array of Point2D objects for
   * which to calculate the centroid.
   *
   * @return {westures-core.Point2D} The centroid of the provided points.
   */ static centroid(points = []) {
        if (points.length === 0) return null;
        const total = $6c3676f10a43b740$var$Point2D.sum(points);
        total.x /= points.length;
        total.y /= points.length;
        return total;
    }
    /**
   * Calculates the sum of the given points.
   *
   * @param {westures-core.Point2D[]} points - The Point2D objects to sum up.
   *
   * @return {westures-core.Point2D} A new Point2D representing the sum of the
   * given points.
   */ static sum(points = []) {
        return points.reduce((total, pt)=>{
            total.x += pt.x;
            total.y += pt.y;
            return total;
        }, new $6c3676f10a43b740$var$Point2D(0, 0));
    }
}
$6c3676f10a43b740$exports = $6c3676f10a43b740$var$Point2D;


var $be6f0e84320366a7$exports = {};
"use strict";
/**
 * List of events that trigger the cancel phase.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $be6f0e84320366a7$var$CANCEL_EVENTS = [
    "blur",
    "pointercancel",
    "touchcancel",
    "mouseleave"
];
/**
 * List of keyboard events that trigger a restart.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $be6f0e84320366a7$var$KEYBOARD_EVENTS = [
    "keydown",
    "keyup"
];
/**
 * List of mouse events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $be6f0e84320366a7$var$MOUSE_EVENTS = [
    "mousedown",
    "mousemove",
    "mouseup"
];
/**
 * List of pointer events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $be6f0e84320366a7$var$POINTER_EVENTS = [
    "pointerdown",
    "pointermove",
    "pointerup"
];
/**
 * List of touch events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $be6f0e84320366a7$var$TOUCH_EVENTS = [
    "touchend",
    "touchmove",
    "touchstart"
];
/**
 * List of potentially state-modifying keys.
 * Entries are: ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $be6f0e84320366a7$var$STATE_KEYS = [
    "altKey",
    "ctrlKey",
    "metaKey",
    "shiftKey"
];
/**
 * List of the 'key' values on KeyboardEvent objects of the potentially
 * state-modifying keys.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $be6f0e84320366a7$var$STATE_KEY_STRINGS = [
    "Alt",
    "Control",
    "Meta",
    "Shift"
];
/**
 * The cancel phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $be6f0e84320366a7$var$CANCEL = "cancel";
/**
 * The end phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $be6f0e84320366a7$var$END = "end";
/**
 * The move phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $be6f0e84320366a7$var$MOVE = "move";
/**
 * The start phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $be6f0e84320366a7$var$START = "start";
/**
 * The recognized phases.
 *
 * @memberof westures-core
 * @type {list.<string>}
 */ const $be6f0e84320366a7$var$PHASES = [
    $be6f0e84320366a7$var$START,
    $be6f0e84320366a7$var$MOVE,
    $be6f0e84320366a7$var$END,
    $be6f0e84320366a7$var$CANCEL
];
/**
 * Object that normalizes the names of window events to be either of type start,
 * move, end, or cancel.
 *
 * @memberof westures-core
 * @type {object}
 */ const $be6f0e84320366a7$var$PHASE = {
    blur: $be6f0e84320366a7$var$CANCEL,
    pointercancel: $be6f0e84320366a7$var$CANCEL,
    touchcancel: $be6f0e84320366a7$var$CANCEL,
    mouseup: $be6f0e84320366a7$var$END,
    pointerup: $be6f0e84320366a7$var$END,
    touchend: $be6f0e84320366a7$var$END,
    mousemove: $be6f0e84320366a7$var$MOVE,
    pointermove: $be6f0e84320366a7$var$MOVE,
    touchmove: $be6f0e84320366a7$var$MOVE,
    mousedown: $be6f0e84320366a7$var$START,
    pointerdown: $be6f0e84320366a7$var$START,
    touchstart: $be6f0e84320366a7$var$START
};
$be6f0e84320366a7$exports = {
    CANCEL_EVENTS: $be6f0e84320366a7$var$CANCEL_EVENTS,
    KEYBOARD_EVENTS: $be6f0e84320366a7$var$KEYBOARD_EVENTS,
    MOUSE_EVENTS: $be6f0e84320366a7$var$MOUSE_EVENTS,
    POINTER_EVENTS: $be6f0e84320366a7$var$POINTER_EVENTS,
    TOUCH_EVENTS: $be6f0e84320366a7$var$TOUCH_EVENTS,
    STATE_KEYS: $be6f0e84320366a7$var$STATE_KEYS,
    STATE_KEY_STRINGS: $be6f0e84320366a7$var$STATE_KEY_STRINGS,
    CANCEL: $be6f0e84320366a7$var$CANCEL,
    END: $be6f0e84320366a7$var$END,
    MOVE: $be6f0e84320366a7$var$MOVE,
    START: $be6f0e84320366a7$var$START,
    PHASE: $be6f0e84320366a7$var$PHASE,
    PHASES: $be6f0e84320366a7$var$PHASES
};


var $0ca7bfe1c074e8ca$require$PHASE = $be6f0e84320366a7$exports.PHASE;
/**
 * @private
 * @inner
 * @memberof westures-core.PointerData
 *
 * @return {Event} The Event object which corresponds to the given identifier.
 *    Contains clientX, clientY values.
 */ function $0ca7bfe1c074e8ca$var$getEventObject(event, identifier) {
    if (event.changedTouches) return Array.from(event.changedTouches).find((touch)=>{
        return touch.identifier === identifier;
    });
    return event;
}
/**
 * Low-level storage of pointer data based on incoming data from an interaction
 * event.
 *
 * @memberof westures-core
 *
 * @param {Event} event - The event object being wrapped.
 * @param {number} identifier - The index of touch if applicable
 */ class $0ca7bfe1c074e8ca$var$PointerData {
    constructor(event, identifier){
        const { clientX: clientX , clientY: clientY  } = $0ca7bfe1c074e8ca$var$getEventObject(event, identifier);
        /**
     * The original event object.
     *
     * @type {Event}
     */ this.event = event;
        /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end' or 'cancel'
     *
     * @type {string}
     */ this.type = $0ca7bfe1c074e8ca$require$PHASE[event.type];
        /**
     * The timestamp of the event in milliseconds elapsed since January 1, 1970,
     * 00:00:00 UTC.
     *
     * @type {number}
     */ this.time = Date.now();
        /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     *
     * @type {westures-core.Point2D}
     */ this.point = new $6c3676f10a43b740$exports(clientX, clientY);
    }
}
$0ca7bfe1c074e8ca$exports = $0ca7bfe1c074e8ca$var$PointerData;


var $4559ecf940edc78d$exports = {};
"use strict";
const $4559ecf940edc78d$var$PI_2 = 2 * Math.PI;
const $4559ecf940edc78d$var$PI_NVE = -Math.PI;
/**
 * Helper function to regulate angular differences, so they don't jump from 0 to
 * 2 * PI or vice versa.
 *
 * @memberof westures-core
 *
 * @param {number} a - Angle in radians.
 * @param {number} b - Angle in radians.

 * @return {number} c, given by: c = a - b such that |c| < PI
 */ function $4559ecf940edc78d$var$angularDifference(a, b) {
    let diff = a - b;
    if (diff < $4559ecf940edc78d$var$PI_NVE) diff += $4559ecf940edc78d$var$PI_2;
    else if (diff > Math.PI) diff -= $4559ecf940edc78d$var$PI_2;
    return diff;
}
/**
 * In case event.composedPath() is not available.
 *
 * @memberof westures-core
 *
 * @param {Event} event
 *
 * @return {Element[]} The elements along the composed path of the event.
 */ function $4559ecf940edc78d$var$getPropagationPath(event) {
    if (typeof event.composedPath === "function") return event.composedPath();
    const path = [];
    for(let node = event.target; node !== document; node = node.parentNode)path.push(node);
    path.push(document);
    path.push(window);
    return path;
}
/**
 * Performs a set filter operation.
 *
 * @memberof westures-core
 *
 * @param {Set} set - The set to filter.
 * @param {Function} predicate - Function to test elements of 'set'. Receives
 * one argument: the current set element.
 *
 * @return {Set} Set consisting of elements in 'set' for which 'predicate' is
 * true.
 */ function $4559ecf940edc78d$var$setFilter(set, predicate) {
    const result = new Set();
    set.forEach((element)=>{
        if (predicate(element)) result.add(element);
    });
    return result;
}
/**
 * Performs a set difference operation.
 *
 * @memberof westures-core
 *
 * @param {Set} left - Base set.
 * @param {Set} right - Set of elements to remove from 'left'.
 *
 * @return {Set} Set consisting of elements in 'left' that are not in
 * 'right'.
 */ function $4559ecf940edc78d$var$setDifference(left, right) {
    return $4559ecf940edc78d$var$setFilter(left, (element)=>!right.has(element));
}
$4559ecf940edc78d$exports = {
    angularDifference: $4559ecf940edc78d$var$angularDifference,
    getPropagationPath: $4559ecf940edc78d$var$getPropagationPath,
    setDifference: $4559ecf940edc78d$var$setDifference,
    setFilter: $4559ecf940edc78d$var$setFilter
};


var $e2125e2e71e37a0c$require$getPropagationPath = $4559ecf940edc78d$exports.getPropagationPath;
/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events.
 *
 * @memberof westures-core
 *
 * @param {(PointerEvent | MouseEvent | TouchEvent)} event - The input event
 * which will initialize this Input object.
 * @param {number} identifier - The identifier for this input, so that it can
 * be located in subsequent Event objects.
 */ class $e2125e2e71e37a0c$var$Input {
    constructor(event, identifier){
        const currentData = new $0ca7bfe1c074e8ca$exports(event, identifier);
        /**
     * The set of elements along the original event's propagation path at the
     * time it was dispatched.
     *
     * @type {WeakSet.<Element>}
     */ this.initialElements = new WeakSet($e2125e2e71e37a0c$require$getPropagationPath(event));
        /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @type {westures-core.PointerData}
     */ this.initial = currentData;
        /**
     * Holds the most current pointer data for this Input.
     *
     * @type {westures-core.PointerData}
     */ this.current = currentData;
        /**
     * Holds the previous pointer data for this Input.
     *
     * @type {westures-core.PointerData}
     */ this.previous = currentData;
        /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @type {number}
     */ this.identifier = identifier;
    }
    /**
   * The phase of the input: 'start' or 'move' or 'end' or 'cancel'
   *
   * @type {string}
   */ get phase() {
        return this.current.type;
    }
    /**
   * The timestamp of the initiating event for this input.
   *
   * @type {number}
   */ get startTime() {
        return this.initial.time;
    }
    /**
   * The amount of time elapsed between the start of this input and its latest
   * event.
   *
   * @type {number}
   */ get elapsedTime() {
        return this.current.time - this.initial.time;
    }
    /**
   * @return {number} The distance between the initiating event for this input
   *    and its current event.
   */ totalDistance() {
        return this.initial.point.distanceTo(this.current.point);
    }
    /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   */ update(event) {
        this.previous = this.current;
        this.current = new $0ca7bfe1c074e8ca$exports(event, this.identifier);
    }
}
$e2125e2e71e37a0c$exports = $e2125e2e71e37a0c$var$Input;




var $b66a0f22c18e3e3d$exports = {};
"use strict";
var $639be6fb478a6d5a$exports = {};
"use strict";

var $639be6fb478a6d5a$require$CANCEL = $be6f0e84320366a7$exports.CANCEL;
var $639be6fb478a6d5a$require$END = $be6f0e84320366a7$exports.END;
var $639be6fb478a6d5a$require$MOVE = $be6f0e84320366a7$exports.MOVE;
var $639be6fb478a6d5a$require$PHASE = $be6f0e84320366a7$exports.PHASE;
var $639be6fb478a6d5a$require$START = $be6f0e84320366a7$exports.START;


const $639be6fb478a6d5a$var$symbols = {
    inputs: Symbol.for("inputs")
};
/**
 * Set of helper functions for updating inputs based on type of input.
 * Must be called with a bound 'this', via bind(), or call(), or apply().
 *
 * @private
 * @inner
 * @memberof westure-core.State
 */ const $639be6fb478a6d5a$var$update_fns = {
    TouchEvent: function TouchEvent(event) {
        Array.from(event.changedTouches).forEach((touch)=>{
            this.updateInput(event, touch.identifier);
        });
    },
    PointerEvent: function PointerEvent(event) {
        this.updateInput(event, event.pointerId);
    },
    MouseEvent: function MouseEvent(event) {
        if (event.button === 0) this.updateInput(event, event.button);
    }
};
/**
 * Keeps track of currently active and ending input points on the interactive
 * surface.
 *
 * @memberof westures-core
 *
 * @param {Element} element - The element underpinning the associated Region.
 */ class $639be6fb478a6d5a$var$State {
    constructor(element){
        /**
     * Keep a reference to the element for the associated region.
     *
     * @type {Element}
     */ this.element = element;
        /**
     * Keeps track of the current Input objects.
     *
     * @alias [@@inputs]
     * @type {Map.<westures-core.Input>}
     * @memberof westure-core.State
     */ this[$639be6fb478a6d5a$var$symbols.inputs] = new Map();
        /**
     * All currently valid inputs, including those that have ended.
     *
     * @type {westures-core.Input[]}
     */ this.inputs = [];
        /**
     * The array of currently active inputs, sourced from the current Input
     * objects. "Active" is defined as not being in the 'end' phase.
     *
     * @type {westures-core.Input[]}
     */ this.active = [];
        /**
     * The array of latest point data for the currently active inputs, sourced
     * from this.active.
     *
     * @type {westures-core.Point2D[]}
     */ this.activePoints = [];
        /**
     * The centroid of the currently active points.
     *
     * @type {westures-core.Point2D}
     */ this.centroid = {};
        /**
     * The latest event that the state processed.
     *
     * @type {Event}
     */ this.event = null;
    }
    /**
   * Deletes all inputs that are in the 'end' phase.
   */ clearEndedInputs() {
        this[$639be6fb478a6d5a$var$symbols.inputs].forEach((v, k)=>{
            if (v.phase === "end") this[$639be6fb478a6d5a$var$symbols.inputs].delete(k);
        });
    }
    /**
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {westures-core.Input[]} Inputs in the given phase.
   */ getInputsInPhase(phase) {
        return this.inputs.filter((i)=>i.phase === phase);
    }
    /**
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {westures-core.Input[]} Inputs <b>not</b> in the given phase.
   */ getInputsNotInPhase(phase) {
        return this.inputs.filter((i)=>i.phase !== phase);
    }
    /**
   * @return {boolean} True if there are no active inputs. False otherwise.
   */ hasNoInputs() {
        return this[$639be6fb478a6d5a$var$symbols.inputs].size === 0;
    }
    /**
   * Update the input with the given identifier using the given event.
   *
   * @private
   *
   * @param {Event} event - The event being captured.
   * @param {number} identifier - The identifier of the input to update.
   */ updateInput(event, identifier) {
        switch($639be6fb478a6d5a$require$PHASE[event.type]){
            case $639be6fb478a6d5a$require$START:
                this[$639be6fb478a6d5a$var$symbols.inputs].set(identifier, new $e2125e2e71e37a0c$exports(event, identifier));
                try {
                    this.element.setPointerCapture(identifier);
                } catch (e) {
                // NOP: Optional operation failed.
                }
                break;
            // All of 'end', 'move', and 'cancel' perform updates, hence the
            // following fall-throughs
            case $639be6fb478a6d5a$require$END:
                try {
                    this.element.releasePointerCapture(identifier);
                } catch (e) {
                // NOP: Optional operation failed.
                }
            case $639be6fb478a6d5a$require$CANCEL:
            case $639be6fb478a6d5a$require$MOVE:
                if (this[$639be6fb478a6d5a$var$symbols.inputs].has(identifier)) this[$639be6fb478a6d5a$var$symbols.inputs].get(identifier).update(event);
                break;
            default:
                console.warn(`Unrecognized event type: ${event.type}`);
        }
    }
    /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @private
   * @param {Event} event - The event being captured.
   */ updateAllInputs(event) {
        $639be6fb478a6d5a$var$update_fns[event.constructor.name].call(this, event);
        this.updateFields(event);
    }
    /**
   * Updates the convenience fields.
   *
   * @private
   * @param {Event} event - Event with which to update the convenience fields.
   */ updateFields(event) {
        this.inputs = Array.from(this[$639be6fb478a6d5a$var$symbols.inputs].values());
        this.active = this.getInputsNotInPhase("end");
        this.activePoints = this.active.map((i)=>i.current.point);
        this.centroid = $6c3676f10a43b740$exports.centroid(this.activePoints);
        this.event = event;
    }
}
$639be6fb478a6d5a$exports = $639be6fb478a6d5a$var$State;



var $b66a0f22c18e3e3d$require$CANCEL_EVENTS = $be6f0e84320366a7$exports.CANCEL_EVENTS;
var $b66a0f22c18e3e3d$require$KEYBOARD_EVENTS = $be6f0e84320366a7$exports.KEYBOARD_EVENTS;
var $b66a0f22c18e3e3d$require$MOUSE_EVENTS = $be6f0e84320366a7$exports.MOUSE_EVENTS;
var $b66a0f22c18e3e3d$require$POINTER_EVENTS = $be6f0e84320366a7$exports.POINTER_EVENTS;
var $b66a0f22c18e3e3d$require$TOUCH_EVENTS = $be6f0e84320366a7$exports.TOUCH_EVENTS;
var $b66a0f22c18e3e3d$require$STATE_KEY_STRINGS = $be6f0e84320366a7$exports.STATE_KEY_STRINGS;
var $b66a0f22c18e3e3d$require$PHASE = $be6f0e84320366a7$exports.PHASE;
var $b66a0f22c18e3e3d$require$CANCEL = $be6f0e84320366a7$exports.CANCEL;
var $b66a0f22c18e3e3d$require$END = $be6f0e84320366a7$exports.END;
var $b66a0f22c18e3e3d$require$START = $be6f0e84320366a7$exports.START;

var $b66a0f22c18e3e3d$require$setDifference = $4559ecf940edc78d$exports.setDifference;
var $b66a0f22c18e3e3d$require$setFilter = $4559ecf940edc78d$exports.setFilter;
/**
 * Allows the user to specify the control region which will listen for user
 * input events.
 *
 * @memberof westures-core
 *
 * @param {Element} element=window - The element which should listen to input
 * events.
 * @param {object} [options]
 * @param {boolean} [options.capture=false] - Whether the region uses the
 * capture phase of input events. If false, uses the bubbling phase.
 * @param {boolean} [options.preferPointer=true] - If false, the region listens
 * to mouse/touch events instead of pointer events.
 * @param {boolean} [options.preventDefault=true] - Whether the default
 * browser functionality should be disabled. This option should most likely be
 * ignored. Here there by dragons if set to false.
 * @param {string} [options.touchAction='none'] - Value to set the CSS
 * 'touch-action' property to on elements added to the region.
 */ class $b66a0f22c18e3e3d$var$Region {
    constructor(element = window, options = {}){
        options = {
            ...$b66a0f22c18e3e3d$var$Region.DEFAULTS,
            ...options
        };
        /**
     * The list of relations between elements, their gestures, and the handlers.
     *
     * @type {Set.<westures-core.Gesture>}
     */ this.gestures = new Set();
        /**
     * The list of active gestures for the current input session.
     *
     * @type {Set.<westures-core.Gesture>}
     */ this.activeGestures = new Set();
        /**
     * The base list of potentially active gestures for the current input
     * session.
     *
     * @type {Set.<westures-core.Gesture>}
     */ this.potentialGestures = new Set();
        /**
     * The element being bound to.
     *
     * @type {Element}
     */ this.element = element;
        /**
     * The user-supplied options for the Region.
     *
     * @type {object}
     */ this.options = options;
        /**
     * The internal state object for a Region.  Keeps track of inputs.
     *
     * @type {westures-core.State}
     */ this.state = new $639be6fb478a6d5a$exports(this.element);
        // Begin operating immediately.
        this.activate();
    }
    /**
   * Activates the region by adding event listeners for all appropriate input
   * events to the region's element.
   *
   * @private
   */ activate() {
        /*
     * Listening to both mouse and touch comes with the difficulty that
     * preventDefault() must be called to prevent both events from iterating
     * through the system. However I have left it as an option to the end user,
     * which defaults to calling preventDefault(), in case there's a use-case I
     * haven't considered or am not aware of.
     *
     * It also may be a good idea to keep regions small in large pages.
     *
     * See:
     *  https://www.html5rocks.com/en/mobile/touchandmouse/
     *  https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
     *  https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
     */ let eventNames = [];
        if (this.options.preferPointer && window.PointerEvent) eventNames = $b66a0f22c18e3e3d$require$POINTER_EVENTS;
        else eventNames = $b66a0f22c18e3e3d$require$MOUSE_EVENTS.concat($b66a0f22c18e3e3d$require$TOUCH_EVENTS);
        // Bind detected browser events to the region element.
        const arbitrate = this.arbitrate.bind(this);
        eventNames.forEach((eventName)=>{
            this.element.addEventListener(eventName, arbitrate, {
                capture: this.options.capture,
                once: false,
                passive: false
            });
        });
        const cancel = this.cancel.bind(this);
        $b66a0f22c18e3e3d$require$CANCEL_EVENTS.forEach((eventName)=>{
            window.addEventListener(eventName, cancel);
        });
        const handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
        $b66a0f22c18e3e3d$require$KEYBOARD_EVENTS.forEach((eventName)=>{
            window.addEventListener(eventName, handleKeyboardEvent);
        });
    }
    /**
   * Handles a cancel event. Resets the state and the active / potential gesture
   * lists.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */ cancel(event) {
        if (this.options.preventDefault) event.preventDefault();
        this.state.inputs.forEach((input)=>{
            input.update(event);
        });
        this.activeGestures.forEach((gesture)=>{
            gesture.evaluateHook($b66a0f22c18e3e3d$require$CANCEL, this.state);
        });
        this.state = new $639be6fb478a6d5a$exports(this.element);
        this.resetActiveGestures();
    }
    /**
   * Handles a keyboard event, triggering a restart of any gestures that need
   * it.
   *
   * @private
   * @param {KeyboardEvent} event - The keyboard event.
   */ handleKeyboardEvent(event) {
        if ($b66a0f22c18e3e3d$require$STATE_KEY_STRINGS.indexOf(event.key) >= 0) {
            this.state.event = event;
            const oldActiveGestures = this.activeGestures;
            this.setActiveGestures();
            $b66a0f22c18e3e3d$require$setDifference(oldActiveGestures, this.activeGestures).forEach((gesture)=>{
                gesture.evaluateHook($b66a0f22c18e3e3d$require$END, this.state);
            });
            $b66a0f22c18e3e3d$require$setDifference(this.activeGestures, oldActiveGestures).forEach((gesture)=>{
                gesture.evaluateHook($b66a0f22c18e3e3d$require$START, this.state);
            });
        }
    }
    /**
   * Resets the active gestures.
   *
   * @private
   */ resetActiveGestures() {
        this.potentialGestures = new Set();
        this.activeGestures = new Set();
    }
    /**
   * Selects active gestures from the list of potentially active gestures.
   *
   * @private
   */ setActiveGestures() {
        this.activeGestures = $b66a0f22c18e3e3d$require$setFilter(this.potentialGestures, (gesture)=>{
            return gesture.isEnabled(this.state);
        });
    }
    /**
   * Selects the potentially active gestures.
   *
   * @private
   */ setPotentialGestures() {
        const input = this.state.inputs[0];
        this.potentialGestures = $b66a0f22c18e3e3d$require$setFilter(this.gestures, (gesture)=>{
            return input.initialElements.has(gesture.element);
        });
    }
    /**
   * Selects the gestures that are active for the current input sequence.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   * @param {boolean} isInitial - Whether this is an initial contact.
   */ updateActiveGestures(event, isInitial) {
        if ($b66a0f22c18e3e3d$require$PHASE[event.type] === $b66a0f22c18e3e3d$require$START) {
            if (isInitial) this.setPotentialGestures();
            this.setActiveGestures();
        }
    }
    /**
   * Evaluates whether the current input session has completed.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */ pruneActiveGestures(event) {
        if ($b66a0f22c18e3e3d$require$PHASE[event.type] === $b66a0f22c18e3e3d$require$END) {
            if (this.state.hasNoInputs()) this.resetActiveGestures();
            else this.setActiveGestures();
        }
    }
    /**
   * All input events flow through this function. It makes sure that the input
   * state is maintained, determines which gestures to analyze based on the
   * initial position of the inputs, calls the relevant gesture hooks, and
   * dispatches gesture data.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */ arbitrate(event) {
        const isInitial = this.state.hasNoInputs();
        this.state.updateAllInputs(event);
        this.updateActiveGestures(event, isInitial);
        if (this.activeGestures.size > 0) {
            if (this.options.preventDefault) event.preventDefault();
            this.activeGestures.forEach((gesture)=>{
                gesture.evaluateHook($b66a0f22c18e3e3d$require$PHASE[event.type], this.state);
            });
        }
        this.state.clearEndedInputs();
        this.pruneActiveGestures(event);
    }
    /**
   * Adds the given gesture to the region.
   *
   * @param {westures-core.Gesture} gesture - Instantiated gesture to add.
   */ addGesture(gesture) {
        gesture.element.style.touchAction = this.options.touchAction;
        this.gestures.add(gesture);
    }
    /**
   * Removes the given gesture from the region.
   *
   * @param {westures-core.Gesture} gesture - Instantiated gesture to add.
   */ removeGesture(gesture) {
        this.gestures.delete(gesture);
        this.potentialGestures.delete(gesture);
        this.activeGestures.delete(gesture);
    }
    /**
   * Retrieves Gestures by their associated element.
   *
   * @param {Element} element - The element for which to find gestures.
   *
   * @return {westures-core.Gesture[]} Gestures to which the element is bound.
   */ getGesturesByElement(element) {
        return $b66a0f22c18e3e3d$require$setFilter(this.gestures, (gesture)=>gesture.element === element);
    }
    /**
   * Remove all gestures bound to the given element.
   *
   * @param {Element} element - The element to unbind.
   */ removeGesturesByElement(element) {
        this.getGesturesByElement(element).forEach((g)=>this.removeGesture(g));
    }
}
$b66a0f22c18e3e3d$var$Region.DEFAULTS = {
    capture: false,
    preferPointer: true,
    preventDefault: true,
    touchAction: "none"
};
$b66a0f22c18e3e3d$exports = $b66a0f22c18e3e3d$var$Region;


var $01c3d7b128023e4f$exports = {};
"use strict";
const $01c3d7b128023e4f$var$cascade = Symbol("cascade");
const $01c3d7b128023e4f$var$smooth = Symbol("smooth");
/**
 * Determines whether to apply smoothing. Smoothing is on by default but turned
 * off if either:<br>
 *  1. The user explicitly requests that it be turned off.<br>
 *  2. The active pointer is not "coarse".<br>
 *
 * @see {@link
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia}
 *
 * @inner
 * @memberof westures-core.Smoothable
 *
 * @param {boolean} isRequested - Whether smoothing was requested by the user.
 *
 * @returns {boolean} Whether to apply smoothing.
 */ function $01c3d7b128023e4f$var$smoothingIsApplicable(isRequested) {
    if (isRequested) try {
        return window.matchMedia("(pointer: coarse)").matches;
    } catch (e) {
        return true;
    }
    return false;
}
/**
 * A Smoothable datatype is one that is capable of smoothing out a series of
 * values as they come in, one at a time, providing a more consistent series. It
 * does this by creating some inertia in the values using a cascading average.
 * (For those who are interested in such things, this effectively means that it
 * provides a practical application of Zeno's Dichotomy).
 *
 * @example
 * const x = new Smoothable({ identity: 1 });
 * const a = x.next(1);   // 1.0
 * const b = x.next(1.2); // 1.1
 * const c = x.next(0.9); // 1.0
 * const d = x.next(0.6); // 0.8
 * const e = x.next(1.2); // 1.0
 * const f = x.next(1.6); // 1.3
 * x.restart();
 * const g = x.next(0);   // 0.5
 *
 * @memberof westures-core
 *
 * @param {Object} [options]
 * @param {boolean} [options.applySmoothing=true] Whether to apply smoothing to
 * the data.
 * @param {*} [options.identity=0] The identity value of this smoothable data.
 */ class $01c3d7b128023e4f$var$Smoothable {
    constructor(options = {}){
        const final_options = {
            ...$01c3d7b128023e4f$var$Smoothable.DEFAULTS,
            ...options
        };
        /**
     * The function through which smoothed emits are passed.
     *
     * @method
     * @param {*} data - The data to emit.
     *
     * @return {*} The smoothed out data.
     */ this.next = null;
        if ($01c3d7b128023e4f$var$smoothingIsApplicable(final_options.applySmoothing)) this.next = this[$01c3d7b128023e4f$var$smooth].bind(this);
        else this.next = (data)=>data;
        /**
     * The "identity" value of the data that will be smoothed.
     *
     * @type {*}
     * @default 0
     */ this.identity = final_options.identity;
        /**
     * The cascading average of outgoing values.
     *
     * @memberof westures-core.Smoothable
     * @alias [@@cascade]
     * @type {object}
     */ this[$01c3d7b128023e4f$var$cascade] = this.identity;
    }
    /**
   * Restart the Smoothable gesture.
   */ restart() {
        this[$01c3d7b128023e4f$var$cascade] = this.identity;
    }
    /**
   * Smooth out the outgoing data.
   *
   * @memberof westures-core.Smoothable
   * @alias [@@smooth]
   * @param {object} data - The next batch of data to emit.
   *
   * @return {?object}
   */ [$01c3d7b128023e4f$var$smooth](data) {
        const average = this.average(this[$01c3d7b128023e4f$var$cascade], data);
        this[$01c3d7b128023e4f$var$cascade] = average;
        return average;
    }
    /**
   * Average out two values, as part of the smoothing algorithm. Override this
   * method if the data being smoothed is not a Number.
   *
   * @param {number} a
   * @param {number} b
   *
   * @return {number} The average of 'a' and 'b'
   */ average(a, b) {
        return (a + b) / 2;
    }
}
$01c3d7b128023e4f$var$Smoothable.DEFAULTS = {
    applySmoothing: true,
    identity: 0
};
$01c3d7b128023e4f$exports = $01c3d7b128023e4f$var$Smoothable;





module.exports = {
    Gesture: $de0d6a332419bf3c$exports,
    Input: $e2125e2e71e37a0c$exports,
    Point2D: $6c3676f10a43b740$exports,
    PointerData: $0ca7bfe1c074e8ca$exports,
    Region: $b66a0f22c18e3e3d$exports,
    Smoothable: $01c3d7b128023e4f$exports,
    State: $639be6fb478a6d5a$exports,
    ...$be6f0e84320366a7$exports,
    ...$4559ecf940edc78d$exports
};


//# sourceMappingURL=index.js.map
