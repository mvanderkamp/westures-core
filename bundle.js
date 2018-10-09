(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.zingtouch = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * @file ZingTouch.js
 * Main object containing API methods and Gesture constructors
 */

const Region  = require('./src/core/Region.js');
const Gesture = require('./src/core/Gesture.js');
const Pan     = require('./src/gestures/Pan.js');
const Pinch   = require('./src/gestures/Pinch.js');
const Rotate  = require('./src/gestures/Rotate.js');
const Swipe   = require('./src/gestures/Swipe.js');
const Tap     = require('./src/gestures/Tap.js');

/**
 * The global API interface for ZingTouch. Contains a constructor for the
 * Region Object, and constructors for each predefined Gesture.
 * @type {Object}
 * @namespace ZingTouch
 */
module.exports = {
  Gesture,
  Pan,
  Pinch,
  Rotate,
  Swipe,
  Tap,
  Region,
};


},{"./src/core/Gesture.js":3,"./src/core/Region.js":7,"./src/gestures/Pan.js":10,"./src/gestures/Pinch.js":11,"./src/gestures/Rotate.js":12,"./src/gestures/Swipe.js":13,"./src/gestures/Tap.js":14}],2:[function(require,module,exports){
/**
 * @file Binding.js
 */

/**
 * Responsible for creating a binding between an element and a gesture.
 *
 * @class Binding
 */
class Binding {
  /**
   * Constructor function for the Binding class.
   *
   * @param {Element} element - The element to associate the gesture to.
   * @param {Gesture} gesture - A instance of the Gesture type.
   * @param {Function} handler - The function handler to execute when a gesture
   *    is recognized on the associated element.
   */
  constructor(element, gesture, handler) {
    /**
     * The element to associate the gesture to.
     *
     * @type {Element}
     */
    this.element = element;

    /**
     * A instance of the Gesture type.
     *
     * @type {Gesture}
     */
    this.gesture = gesture;

    /**
     * The function handler to execute when a gesture is recognized on the
     * associated element.
     *
     * @type {Function}
     */
    this.handler = handler;

    // Start listening immediately.
    this.listen();
  }

  /**
   * Dispatches a custom event on the bound element, sending the provided data.
   * The event's name will be the id of the bound gesture.
   *
   * @param {Object} data - The data to send with the event.
   */
  dispatch(data) {
    this.element.dispatchEvent(new CustomEvent(
      this.gesture.id, {
        detail: data,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  /**
   * Evalutes the given gesture hook, and dispatches any data that is produced.
   */
  evaluateHook(hook, state, events) {
    const data = this.gesture[hook](state);
    if (data) {
      data.events = events;
      this.dispatch(data);
    }
  }

  /**
   * Sets the bound element to begin listening to events of the same name as the
   * bound gesture's id.
   */
  listen() {
    this.element.addEventListener(
      this.gesture.id,
      this.handler,
    );
  }

  /**
   * Stops listening for events of the same name as the bound gesture's id.
   */
  stop() {
    this.element.removeEventListener(
      this.gesture.id,
      this.handler,
    );
  }
}

module.exports = Binding;


},{}],3:[function(require,module,exports){
/**
 * @file Gesture.js
 * Contains the Gesture class
 */

const util = require('./util.js');

let nextGestureNum = 0;

/**
 * The Gesture class that all gestures inherit from.
 * @class Gesture
 */
class Gesture {
  /**
   * Constructor function for the Gesture class.
   */
  constructor(type) {
    /**
     * The generic string type of gesture. (e.g. 'pan' or 'tap' or 'pinch').
     *
     * @type {String}
     */
    if (typeof type === 'undefined') throw 'Gestures require a type!';
    this.type = type;

    /**
     * The unique identifier for each gesture. This allows for distinctions
     * across instance variables of Gestures that are created on the fly (e.g.
     * gesture-tap-1, gesture-tap-2).
     *
     * @type {String}
     */
    this.id = `gesture-${this.type}-${nextGestureNum++}`;
  }

  /**
   * start() - Event hook for the start of a gesture
   *
   * @param {Object} state - The input state object of the current region.
   *
   * @return {null|Object}  - Default of null
   */
  start(state) {
    return null;
  }

  /**
   * move() - Event hook for the move of a gesture
   *
   * @param {Object} state - The input state object of the current region.
   *
   * @return {null|Object} - Default of null
   */
  move(state) {
    return null;
  }

  /**
   * end() - Event hook for the move of a gesture
   *
   * @param {Object} state - The input state object of the current region.
   *
   * @return {null|Object}  - Default of null
   */
  end(state) {
    return null;
  }
}

module.exports = Gesture;


},{"./util.js":9}],4:[function(require,module,exports){
/**
 * @file Input.js
 */

const PointerData = require('./PointerData.js');

/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events.  Contains the progress of each Input and it's associated
 * gestures.
 *
 * @class Input
 */
class Input {
  /**
   * Constructor function for the Input class.
   *
   * @param {Event} event - The Event object from the window
   * @param {Number} [identifier=0] - The identifier for this input (taken
   *    from event.changedTouches or this input's button number)
   */
  constructor(event, identifier = 0) {
    const currentData = new PointerData(event, identifier);

    /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @type {PointerData}
     */
    this.initial = currentData;

    /**
     * Holds the most current pointer data for this Input.
     *
     * @type {PointerData}
     */
    this.current = currentData;

    /**
     * Holds the previous pointer data for this Input.
     *
     * @type {PointerData}
     */
    this.previous = currentData;

    /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @type {Number}
     */
    this.identifier = identifier;

    /**
     * Stores internal state between events for each gesture based off of the
     * gesture's id.
     *
     * @type {Object}
     */
    this.progress = {};
  }

  /**
   * @return {String} The phase of the input: 'start' or 'move' or 'end'
   */
  get phase()       { return this.current.type; }

  /**
   * @return {Number} The timestamp of the most current event for this input.
   */
  get currentTime() { return this.current.time; }

  /**
   * @return {Number} The timestamp of the initiating event for this input.
   */
  get startTime()   { return this.initial.time; }

  /**
   * @return {Point2D} A clone of the current point.
   */
  cloneCurrentPoint() {
    return this.current.point.clone();
  }

  /**
   * @return {Number} The angle in radians between the inputs' current events.
   */
  currentAngleTo(input) {
    return this.current.angleTo(input.current);
  }

  /**
   * Determines the distance between the current events for two inputs.
   *
   * @return {Number} The distance between the inputs' current events.
   */
  currentDistanceTo(input) {
    return this.current.distanceTo(input.current);
  }

  /**
   * @return {Number} The midpoint between the inputs' current events.
   */
  currentMidpointTo(input) {
    return this.current.midpointTo(input.current);
  }

  /**
   * @param {String} id - The identifier for each unique Gesture's progress.
   *
   * @return {Object} - The progress of the gesture.
   */
  getProgressOfGesture(id) {
    if (!this.progress[id]) {
      this.progress[id] = {};
    }
    return this.progress[id];
  }

  /**
   * @return {Number} The angle, in radians, between the initiating event for
   * this input and its current event.
   */
  totalAngle() {
    return this.initial.angleTo(this.current);
  }

  /**
   * @return {Number} The distance between the initiating event for this input
   * and its current event.
   */
  totalDistance() {
    return this.initial.distanceTo(this.current);
  }

  /**
   * @return {Boolean} true if the total distance is less than or equal to the
   * tolerance.
   */
  totalDistanceIsWithin(tolerance) {
    return this.totalDistance() <= tolerance;
  }

  /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   * @param {Number} touchIdentifier - The index of inputs, from event.touches
   */
  update(event) {
    this.previous = this.current;
    this.current = new PointerData(event, this.identifier);
  }

  /**
   * @return {Boolean} true if the given element existed along the propagation
   * path of this input's initiating event.
   */
  wasInitiallyInside(element) {
    return this.initial.wasInside(element);
  }
}

module.exports = Input;


},{"./PointerData.js":6}],5:[function(require,module,exports){
/**
 * @File Point2D.js
 *
 * Defines a 2D point class.
 */

/**
 * The Point2D class stores and operates on 2-dimensional points, represented as
 * x and y coordinates.
 *
 * @class Point2D
 */
class Point2D {
  /**
   * Constructor function for the Point2D class.
   */
  constructor(x = 0, y = 0) {
    /**
     * The horizontal (x) coordinate of the point.
     *
     * @type {Number}
     */
    this.x = x;

    /**
     * The vertical (y) coordinate of the point.
     *
     * @type {Number}
     */
    this.y = y;
  }

  /**
   * Add this point to the given point.
   *
   * @param {Point2D} point
   *
   * @return {Point2D} A new Point2D, which is the addition of the two points.
   */
  add(point) {
    return new Point2D(
      this.x + point.x,
      this.y + point.y,
    );
  }

  /**
   * Calculates the angle between this point and the given point.
   *   |                (projectionX,projectionY)
   *   |             /°
   *   |          /
   *   |       /
   *   |    / θ
   *   | /__________
   *   ° (originX, originY)
   *
   * @param {Point2D} point - The projection
   *
   * @return {Number} - Radians along the unit circle where the projection lies.
   */
  angleTo(point) {
    return Math.atan2(point.y - this.y, point.x - this.x);
  }

  /**
   * Determine the average distance from this point to the provided array of
   * points.
   *
   * @param {Array} points - the Point2D objects to calculate the average
   *    distance to.
   *
   * @return {Number} The average distance from this point to the provided
   *    points.
   */
  averageDistanceTo(points = []) {
    return this.totalDistanceTo(points) / points.length;
  }

  /**
   * Clone this point.
   *
   * @return {Point2D} A new Point2D, identical to this point.
   */
  clone() {
    return new Point2D(this.x, this.y);
  }

  /**
   * Calculates the distance between two points.
   *
   * @param {Point2D} point
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse. 
   */
  distanceTo(point) {
    return Math.hypot(point.x - this.x, point.y - this.y);
  }

  /**
   * Determines if this point is within the given HTML element.
   *
   * @param {Element} target
   *
   * @return {Boolean} true if the given point is within element, false
   *    otherwise. 
   */
  isInside(element) {
    const rect = element.getBoundingClientRect();
    return (
      this.x >= rect.left &&
      this.x <= (rect.left + rect.width) &&
      this.y >= rect.top &&
      this.y <= (rect.top + rect.height)
    );
  }

  /**
   * Calculates the midpoint coordinates between two points.
   *
   * @param {Point2D} point
   *
   * @return {Point2D} The coordinates of the midpoint.
   */
  midpointTo(point) {
    return new Point2D(
      (this.x + point.x) / 2,
      (this.y + point.y) / 2,
    );
  }

  /**
   * Subtract the given point from this point.
   *
   * @param {Point2D} point
   *
   * @return {Point2D} A new Point2D, which is the result of (this - point).
   */
  subtract(point) {
    return new Point2D(
      this.x - point.x,
      this.y - point.y
    );
  }

  /**
   * Calculates the total distance from this point to an array of points.
   *
   * @param {Array} points - The array of Point2D objects to calculate the total
   *    distance to.
   *
   * @return {Number} The total distance from this point to the provided points.
   */
  totalDistanceTo(points = []) {
    return points.reduce( (d, p) => d + this.distanceTo(p), 0);
  }
}

/**
 * Calculates the midpoint of a list of points.
 *
 * @param {Array} points - The array of Point2D objects for which to calculate
 *    the midpoint
 *
 * @return {Point2D} The midpoint of the provided points.
 */
Point2D.midpoint = function(points = []) {
  if (points.length === 0) throw 'Need points to exist to calculate midpoint!';
  const total = Point2D.sum(points);
  return new Point2D (
    total.x / points.length,
    total.y / points.length,
  );
}

/**
 * Calculates the sum of the given points.
 *
 * @param {Array} points - The Point2D objects to sum up.
 *
 * @return {Point2D} A new Point2D representing the sum of the given points.
 */
Point2D.sum = function(points = []) {
  return points.reduce( (total, current) => {
    total.x += current.x;
    total.y += current.y;
    return total;
  }, new Point2D(0,0) );
}

module.exports = Point2D;


},{}],6:[function(require,module,exports){
/**
 * @file PointerData.js
 * Contains logic for PointerDatas
 */

const util    = require('./util.js');
const Point2D = require('./Point2D.js');

/**
 * Low-level storage of pointer data based on incoming data from an interaction
 * event.
 *
 * @class PointerData
 */
class PointerData {
  /**
   * @constructor
   *
   * @param {Event} event - The event object being wrapped.
   * @param {Array} event.touches - The number of touches on a screen (mobile
   *    only).
   * @param {Object} event.changedTouches - The TouchList representing points
   *    that participated in the event.
   * @param {Number} touchIdentifier - The index of touch if applicable
   */
  constructor(event, identifier) {
    /**
     * The set of elements along the original event's propagation path at the
     * time it was dispatched.
     *
     * @type {WeakSet}
     */
    this.initialElements = getInitialElementsInPath(event);

    /**
     * The original event object.
     *
     * @type {Event}
     */
    this.originalEvent = event;

    /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end'.
     *
     * @type {String | null}
     */
    this.type = util.normalizeEvent[ event.type ];

    /**
     * The timestamp of the event in milliseconds elapsed since January 1, 1970,
     * 00:00:00 UTC.
     * 
     * @type {Number}
     */
    this.time = Date.now();

    /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     */
    const eventObj = getEventObject(event, identifier);
    this.point = new Point2D(eventObj.clientX, eventObj.clientY);
  }

  /**
   * Calculates the angle between this event and the given event.
   *
   * @param {PointerData} pdata
   *
   * @return {Number} - Radians measurement between this event and the given
   *    event's points.
   */
  angleTo(pdata) {
    return this.point.angleTo(pdata.point);
  }

  /**
   * Calculates the distance between two PointerDatas.
   *
   * @param {PointerData} pdata
   *
   * @return {Number} The distance between the two points, a.k.a. the
   *    hypoteneuse. 
   */
  distanceTo(pdata) {
    return this.point.distanceTo(pdata.point);
  }

  /**
   * Determines if this PointerData is within the given HTML element.
   *
   * @param {Element} target
   *
   * @return {Boolean}
   */
  isInside(element) {
    return this.point.isInside(element);
  }

  /**
   * Calculates the midpoint coordinates between two PointerData objects.
   *
   * @param {PointerData} pdata
   *
   * @return {Point2D} The coordinates of the midpoint.
   */
  midpointTo(pdata) {
    return this.point.midpointTo(pdata.point);
  }

  /**
   * Determines if this PointerData was inside the given element at the time it
   * was dispatched.
   *
   * @param {Element} element
   *
   * @return {Boolean} true if the PointerData occurred inside the element,
   *    false otherwise.
   */
  wasInside(element) {
    return this.initialElements.has(element);
  }
}

/**
 * @return {Event} The Event object which corresponds to the given identifier.
 *    Contains clientX, clientY values.
 */
function getEventObject(event, identifier) {
  if (event.changedTouches) {
    return Array.from(event.changedTouches).find( t => {
      return t.identifier === identifier;
    });
  } 
  return event;
}

/**
 * @return {WeakSet} The Elements in the path of the given event.
 */
function getInitialElementsInPath(event) {
  // A WeakSet is used so that references will be garbage collected when the
  // element they point to is removed from the page.
  const set = new WeakSet();
  const path = util.getPropagationPath(event);
  path.forEach( node => set.add(node) );
  return set;
}

module.exports = PointerData;


},{"./Point2D.js":5,"./util.js":9}],7:[function(require,module,exports){
/**
 * @file Region.js
 */

const Binding = require('./Binding.js');
const Gesture = require('./Gesture.js');
const util    = require('./util.js');
const State   = require('./State.js');

const POINTER_EVENTS = [
  'pointerdown',
  'pointermove',
  'pointerup',
];

const MOUSE_EVENTS = [
  'mousedown',
  'mousemove',
  'mouseup',
];

const TOUCH_EVENTS = [
  'touchstart',
  'touchmove',
  'touchend',
];

/**
 * Allows the user to specify a region to capture all events to feed ZingTouch
 * into. This can be as narrow as the element itself, or as big as the document
 * itself. The more specific an area, the better performant the overall
 * application will perform. Contains API methods to bind/unbind specific
 * elements to corresponding gestures. 
 *
 * @class Region
 */
class Region {
  /**
   * Constructor function for the Region class.
   *
   * @param {Element} element - The element to capture all window events in that
   *    region to feed into ZingTouch.
   * @param {boolean} [capture=false] - Whether the region uses the capture or
   *    bubble phase of input events.
   * @param {boolean} [preventDefault=true] - Whether the default browser
   *    functionality should be disabled;
   */
  constructor(element, capture = false, preventDefault = true) {
    /**
     * The list of relations between elements, their gestures, and the handlers.
     *
     * @type {Binding}
     */
    this.bindings = [];

    /**
     * The element being bound to.
     *
     * @type {Element}
     */
    this.element = element;

    /**
     * Whether the region listens for captures or bubbles.
     *
     * @type {boolean}
     */
    this.capture = capture;

    /**
     * Boolean to disable browser functionality such as scrolling and zooming
     * over the region
     *
     * @type {boolean}
     */
    this.preventDefault = preventDefault;

    /**
     * The internal state object for a Region.  Keeps track of inputs and
     * bindings.
     *
     * @type {State}
     */
    this.state = new State();

    // Begin operating immediately.
    this.activate();
  }

  /**
   * Activates the region by adding event listeners for all appropriate input
   * events to the region's element.
   */
  activate() {
    let eventNames = [];
    if (window.PointerEvent && !window.TouchEvent) {
      eventNames = POINTER_EVENTS;
    } else {
      eventNames = MOUSE_EVENTS.concat(TOUCH_EVENTS);
    }

    // Bind detected browser events to the region element.
    const arbiter = this.arbitrate.bind(this);
    eventNames.forEach( eventName => {
      this.element.addEventListener(eventName, arbiter, this.capture);
    });
  }

  /**
   * All input events flow through this function. It makes sure that the input
   * state is maintained, determines which bindings to analyze based on the
   * initial position of the inputs, calls the relevant gesture hooks, and
   * dispatches gesture data.
   *
   * @param {Event} event - The event emitted from the window object.
   */
  arbitrate(event) {
    if (this.preventDefault) event.preventDefault();

    this.state.updateAllInputs(event, this.element);

    const hook = util.normalizeEvent[ event.type ];
    const events = this.state.getCurrentEvents();

    this.retrieveBindingsByInitialPos().forEach( binding => {
      binding.evaluateHook(hook, this.state, events);
    });

    this.state.clearEndedInputs();
  }

  /**
   * Bind an element to a gesture with multiple function signatures.
   *
   * @param {Element} element - The element object.
   * @param {Gesture} gesture - Gesture object.
   * @param {Function} [handler] - The function to execute when an event is
   *    emitted.
   * @param {Boolean} [capture] - capture/bubble
   *
   * @return {Object} - a chainable object that has the same function as bind.
   */
  bind(element, gesture, handler) {
    this.bindings.push( new Binding(element, gesture, handler) );
  }

  /**
   * Retrieves the Binding by which an element is associated to.
   *
   * @param {Element} element - The element to find bindings to.
   *
   * @return {Array} - An array of Bindings to which that element is bound
   */
  retrieveBindingsByElement(element) {
    return this.bindings.filter( b => b.element === element );
  }

  /**
   * Retrieves all bindings based upon the initial X/Y position of the inputs.
   * e.g. if gesture started on the correct target element, but diverted away
   * into the correct region, this would still be valid.
   *
   * @return {Array} - An array of Bindings to which that element is bound
   */
  retrieveBindingsByInitialPos() {
    return this.bindings.filter( 
      b => this.state.someInputWasInitiallyInside(b.element)
    );
  }

  /**
   * Unbinds an element from either the specified gesture or all if no gesture
   * is specified.
   *
   * @param {Element} element - The element to unbind.
   * @param {Gesture} gesture - The gesture to unbind.
   *
   * @return {Array} - An array of Bindings that were unbound to the element;
   */
  unbind(element, gesture) {
    let bindings = this.retrieveBindingsByElement(element);
    let unbound = [];

    bindings.forEach( b => {
      if (gesture == undefined || b.gesture === gesture) {
        b.stop();
        this.bindings.splice(this.bindings.indexOf(b), 1);
        unbound.push(b);
      }
    });

    return unbound;
  }
  /* unbind*/
}

module.exports = Region;


},{"./Binding.js":2,"./Gesture.js":3,"./State.js":8,"./util.js":9}],8:[function(require,module,exports){
/**
 * @file State.js
 */

const Gesture = require('./Gesture.js');
const Binding = require('./Binding.js');
const Input   = require('./Input.js');
const util    = require('./util.js');

const DEFAULT_MOUSE_ID = 0;

/**
 * Creates an object related to a Region's state, and contains helper methods to
 * update and clean up different states.
 *
 * @class State
 */
class State {
  /**
   * Constructor for the State class.
   */
  constructor() {
    /**
     * An array of current Input objects related to a gesture.
     *
     * @type {Input}
     */
    this._inputs_obj = {};
  }

  /**
   * @return {Array} The currently valid inputs.
   */
  get inputs() { return Object.values(this._inputs_obj); }

  /**
   * Deletes all inputs that are in the 'end' phase.
   */
  clearEndedInputs() {
    for (let k in this._inputs_obj) {
      if (this._inputs_obj[k].phase === 'end') delete this._inputs_obj[k];
    }
  }

  /**
   * @return {Array} Current event for all inputs.
   */
  getCurrentEvents() {
    return this.inputs.map( i => i.current );
  }

  /**
   * @return {Array} Inputs in the given phase.
   */
  getInputsInPhase(phase) {
    return this.inputs.filter( i => i.phase === phase );
  }

  /**
   * @return {Array} Inputs _not_ in the given phase.
   */
  getInputsNotInPhase(phase) {
    return this.inputs.filter( i => i.phase !== phase );
  }

  /**
   * @return {Boolean} - true if some input was initially inside the element.
   */
  someInputWasInitiallyInside(element) {
    return this.inputs.some( i => i.wasInitiallyInside(element) );
  }

  /**
   * Update the input with the given identifier using the given event.
   *
   * @param {Event} event - The event being captured.
   * @param {Number} identifier - The identifier of the input to update.
   */
  updateInput(event, identifier) {
    if (util.normalizeEvent[ event.type ] === 'start') {
      this._inputs_obj[identifier] = new Input(event, identifier);
    } else if (this._inputs_obj[identifier]) {
      this._inputs_obj[identifier].update(event);
    }
  }

  /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @param {Event} event - The event being captured.  this current Region is
   *    bound to.
   *
   * @return {boolean} - returns true for a successful update, false if the
   *    event is invalid.
   */
  updateAllInputs(event) {
    const update_fns = {
      TouchEvent: (event) => {
        Array.from(event.changedTouches).forEach( touch => {
          this.updateInput(event, touch.identifier);
        });
      },

      PointerEvent: (event) => {
        this.updateInput(event, event.pointerId);
      },

      MouseEvent: (event) => {
        this.updateInput(event, DEFAULT_MOUSE_ID);
      },
    };

    update_fns[event.constructor.name].call(this, event);
  }
}

module.exports = State;


},{"./Binding.js":2,"./Gesture.js":3,"./Input.js":4,"./util.js":9}],9:[function(require,module,exports){
/**
 * @file util.js
 * Various accessor and mutator functions to handle state and validation.
 */

/**
 * Normalizes window events to be either of type start, move, or end.
 *
 * @param {String} type - The event type emitted by the browser
 *
 * @return {null|String} - The normalized event, or null if it is an event not
 *    predetermined.
 */
const normalizeEvent = Object.freeze({
  mousedown:   'start',
  touchstart:  'start',
  pointerdown: 'start',

  mousemove:   'move',
  touchmove:   'move',
  pointermove: 'move',

  mouseup:   'end',
  touchend:  'end',
  pointerup: 'end',
});
/* normalizeEvent*/

/**
 * @return {Array} Identifiers of the mouse buttons used.
 */
function getMouseButtons(event) {
  const btns = [];
  if (event && event.buttons) {
    for (let mask = 1; mask < 32; mask <<= 1) {
      const btn = event.buttons & mask;
      if (btn > 0) btns.push(btn);
    }
  }
  return btns;
}

/**
 * In case event.composedPath() is not available.
 *
 * @param {Event} event
 *
 * @return {Array}
 */
function getPropagationPath(event) {
  if (typeof event.composedPath === 'function') {
    return event.composedPath();
  } 

  const path = [];
  for (let node = event.target; node !== document; node = node.parentNode) {
    path.push(node);
  }
  path.push(document);
  path.push(window);

  return path;
}

module.exports = Object.freeze({
  normalizeEvent,
  getPropagationPath,
  getMouseButtons,
});


},{}],10:[function(require,module,exports){
/**
 * @file Pan.js
 * Contains the Pan class
 */

const Gesture = require('../core/Gesture.js');
const Point2D = require('../core/Point2D.js');
const util    = require('../core/util.js');

const DEFAULT_INPUTS = 1;
const DEFAULT_MIN_THRESHOLD = 1;

/**
 * A Pan is defined as a normal movement in any direction on a screen.  Pan
 * gestures do not track start events and can interact with pinch and expand
 * gestures.
 *
 * @class Pan
 */
class Pan extends Gesture {
  /**
   * Constructor function for the Pan class.
   *
   * @param {Object} [options] - The options object.
   * @param {Number} [options.threshold=1] - The minimum number of pixels the
   *    input has to move to trigger this gesture.
   */
  constructor(options = {}) {
    super('pan');

    /**
     * The minimum amount in pixels the pan must move until it is fired.
     *
     * @type {Number}
     */
    this.threshold = options.threshold || DEFAULT_MIN_THRESHOLD;
  }

  initialize(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length > 0) {
      const progress = active[0].getProgressOfGesture(this.id);
      progress.lastEmitted = active[0].cloneCurrentPoint();
    }
  }

  /**
   * Event hook for the start of a gesture. Marks each input as active, so it
   * can invalidate any end events.
   *
   * @param {State} input status object
   */
  start(state) {
    this.initialize(state);
  }
  /* start */

  /**
   * move() - Event hook for the move of a gesture.  
   *
   * @param {State} input status object
   *
   * @return {Object} The change in position and the current position.
   */
  move(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length !== 1) return null;

    const progress = active[0].getProgressOfGesture(this.id);
    const point = active[0].current.point;
    const diff = point.distanceTo(progress.lastEmitted);

    if (diff >= this.threshold) {
      const change = point.subtract(progress.lastEmitted);
      progress.lastEmitted = point;
      return { change, point };
    } 

    return null;
  }
  /* move*/

  /**
   * end() - Event hook for the end of a gesture. 
   *
   * @param {State} input status object
   *
   * @return {null} 
   */
  end(state) {
    this.initialize(state);
  }
  /* end*/
}

module.exports = Pan;


},{"../core/Gesture.js":3,"../core/Point2D.js":5,"../core/util.js":9}],11:[function(require,module,exports){
/**
 * @file Pinch.js
 * Contains the abstract Pinch class
 */

const Gesture = require('../core/Gesture.js');
const Point2D = require('../core/Point2D.js');
const util    = require('../core/util.js');

const REQUIRED_INPUTS = 2;
const DEFAULT_MIN_THRESHOLD = 1;

/**
 * A Pinch is defined as two inputs moving either together or apart.
 *
 * @class Pinch
 */
class Pinch extends Gesture {
  /**
   * Constructor function for the Pinch class.
   *
   * @param {Object} options
   */
  constructor(options = {}) {
    super('pinch');

    /**
     * The minimum amount in pixels the inputs must move until it is fired.
     *
     * @type {Number}
     */
    this.threshold = options.threshold || DEFAULT_MIN_THRESHOLD;
  }

  /**
   * Initializes the gesture progress and stores it in the first input for
   * reference events.
   *
   * @param {State} input status object
   */
  initializeProgress(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length < REQUIRED_INPUTS) return null;

    const { midpoint, averageDistance } = getMidpointAndAverageDistance(active);

    // Progress is store on the first active input.
    const progress = active[0].getProgressOfGesture(this.id);
    progress.previousDistance = averageDistance;
  }

  /**
   * Event hook for the start of a gesture. 
   *
   * @param {State} input status object
   */
  start(state) {
    this.initializeProgress(state);
  }

  /**
   * Event hook for the move of a gesture.  Determines if the two points are
   * moved in the expected direction relative to the current distance and the
   * last distance.
   *
   * @param {State} input status object
   *
   * @return {Object | null} - Returns the distance in pixels between two inputs
   */
  move(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length < REQUIRED_INPUTS) return null;

    const { midpoint, averageDistance } = getMidpointAndAverageDistance(active);

    const baseProgress = active[0].getProgressOfGesture(this.id);
    const change = averageDistance - baseProgress.previousDistance;

    if (Math.abs(change) >= this.threshold) {
      // Progress is store on the first active input.
      const progress = active[0].getProgressOfGesture(this.id);
      progress.previousDistance = averageDistance;

      return {
        distance: averageDistance,
        midpoint,
        change,
      };
    }
  }

  /**
   * Event hook for the end of a gesture. 
   *
   * @param {State} input status object
   */
  end(state) {
    this.initializeProgress(state);
  }
}

/**
 * Packs together the midpoint and the average distance to that midpoint of a
 * collection of points, which are gathered from their input objects. These are
 * packed together so that the inputs only have to be mapped to their current
 * points once.
 */
function getMidpointAndAverageDistance(inputs) {
  const points = inputs.map( i => i.current.point );
  const midpoint = Point2D.midpoint(points); 
  const averageDistance = midpoint.averageDistanceTo(points);
  return { midpoint, averageDistance };
}

module.exports = Pinch;


},{"../core/Gesture.js":3,"../core/Point2D.js":5,"../core/util.js":9}],12:[function(require,module,exports){
/**
 * @file Rotate.js
 * Contains the Rotate class
 */

const Gesture = require('../core/Gesture.js');
const Point2D = require('../core/Point2D.js');
const util    = require('../core/util.js');

const REQUIRED_INPUTS = 2;

/**
 * A Rotate is defined as two inputs moving about a circle, maintaining a
 * relatively equal radius.
 *
 * @class Rotate
 */
class Rotate extends Gesture {
  /**
   * Constructor function for the Rotate class.
   */
  constructor() {
    super('rotate');
  }

  /**
   * Initialize the progress of the gesture.  Only runs if the number of active
   * inputs is the expected amount.
   *
   * @param {State} input status object
   */
  initializeProgress(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length !== REQUIRED_INPUTS) return null;

    // Progress is stored on the first active input.
    const angle = active[0].currentAngleTo(active[1]);
    const progress = active[0].getProgressOfGesture(this.id);
    progress.previousAngle = angle;
    progress.distance = 0;
    progress.change = 0;
  }

  /**
   * Event hook for the start of a gesture.
   *
   * @param {State} input status object
   *
   * @return {null}
   */
  start(state) {
    this.initializeProgress(state);
  }

  /**
   * Event hook for the move of a gesture. Obtains the midpoint of two the two
   * inputs and calculates the projection of the right most input along a unit
   * circle to obtain an angle. This angle is compared to the previously
   * calculated angle to output the change of distance, and is compared to the
   * initial angle to output the distance from the initial angle to the current
   * angle.
   *
   * @param {State} input status object
   *
   * @return {null} - null if this event did not occur
   * @return {Object} obj.angle - The current angle along the unit circle
   * @return {Object} obj.distanceFromOrigin - The angular distance travelled
   *    from the initial right most point.
   * @return {Object} obj.distanceFromLast - The change of angle between the
   *    last position and the current position.
   */
  move(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length !== REQUIRED_INPUTS) return null;

    const pivot = active[0].currentMidpointTo(active[1]);
    const angle = active[0].currentAngleTo(active[1]);

    const progress = active[0].getProgressOfGesture(this.id);
    progress.change = angle - progress.previousAngle;
    progress.previousAngle = angle;

    return {
      angle,
      pivot,
      delta: progress.change,
    };
  }
  /* move*/

  /**
   * Event hook for the end of a gesture.
   *
   * @param {State} input status object
   *
   * @return {null}
   */
  end(state) {
    this.initializeProgress(state);
  }
}

module.exports = Rotate;


},{"../core/Gesture.js":3,"../core/Point2D.js":5,"../core/util.js":9}],13:[function(require,module,exports){
/**
 * @file Swipe.js
 * Contains the Swipe class
 */

const Gesture = require('../core/Gesture.js');
const util    = require('../core/util.js');

const REQUIRED_INPUTS = 1;
const DEFAULT_MAX_REST_TIME = 100;
const DEFAULT_ESCAPE_VELOCITY = 0.2;
const DEFAULT_TIME_DISTORTION = 100;
const DEFAULT_MAX_PROGRESS_STACK = 10;

/**
 * A swipe is defined as input(s) moving in the same direction in an relatively
 * increasing velocity and leaving the screen at some point before it drops
 * below it's escape velocity.
 *
 * @class Swipe
 */
class Swipe extends Gesture {
  /**
   * Constructor function for the Swipe class.
   *
   * @param {Object} [options] - The options object.
   * @param {Number} [options.maxRestTime] - The maximum resting time a point
   *    has between it's last
   * @param {Number} [options.escapeVelocity] - The minimum velocity the input
   *    has to be at to emit a swipe.
   * @param {Number} [options.timeDistortion] - (EXPERIMENTAL) A value of time
   *    in milliseconds to distort between events.
   * @param {Number} [options.maxProgressStack] - (EXPERIMENTAL)The maximum
   *    amount of move events to keep track of for a swipe.
   */
  constructor(options = {}) {
    super('swipe');

    /**
     * The maximum resting time a point has between it's last move and current
     * move events.
     *
     * @type {Number}
     */
    this.maxRestTime = options.maxRestTime || DEFAULT_MAX_REST_TIME;

    /**
     * The minimum velocity the input has to be at to emit a swipe.  This is
     * useful for determining the difference between a swipe and a pan gesture.
     *
     * @type {number}
     */
    this.escapeVelocity = options.escapeVelocity || DEFAULT_ESCAPE_VELOCITY;

    /**
     * (EXPERIMENTAL) A value of time in milliseconds to distort between events.
     * Browsers do not accurately measure time with the Date constructor in
     * milliseconds, so consecutive events sometimes display the same timestamp
     * but different x/y coordinates. This will distort a previous time in such
     * cases by the timeDistortion's value.
     *
     * @type {number}
     */
    this.timeDistortion = options.timeDistortion || DEFAULT_TIME_DISTORTION;

    /**
     * (EXPERIMENTAL) The maximum amount of move events to keep track of for a
     * swipe. This helps give a more accurate estimate of the user's velocity.
     *
     * @type {number}
     */
    this.maxProgressStack = options.maxProgressStack || 
      DEFAULT_MAX_PROGRESS_STACK;
  }

  /**
   * Event hook for the move of a gesture. Captures an input's x/y coordinates
   * and the time of it's event on a stack.
   *
   * @param {State} input status object
   *
   * @return {null} - Swipe does not emit from a move.
   */
  move(state) {
    const active = state.getInputsNotInPhase('end');

    active.forEach( input => {
      const progress = input.getProgressOfGesture(this.id);
      if (!progress.moves) progress.moves = [];

      progress.moves.push({
        time: Date.now(),
        point: input.cloneCurrentPoint(),
      });

      while (progress.moves.length > this.maxProgressStack) {
        progress.moves.shift();
      }
    });

    return null;
  }
  /* move*/

  /**
   * Determines if the input's history validates a swipe motion.  Determines if
   * it did not come to a complete stop (maxRestTime), and if it had enough of a
   * velocity to be considered (ESCAPE_VELOCITY).
   *
   * @param {State} input status object
   *
   * @return {null|Object} - null if the gesture is not to be emitted, Object
   *    with information otherwise.
   */
  end(state) {
    const ended = state.getInputsInPhase('end');

    if (ended.length !== REQUIRED_INPUTS) return null;

    const progress = ended[0].getProgressOfGesture(this.id);
    if (!progress.moves || progress.moves.length < 3) return null;

    const len = progress.moves.length;
    const last = progress.moves[len - 1];
    const prev = progress.moves[len - 2];
    const first = progress.moves[len - 3];

    const v1 = velocity(first, prev);
    const v2 = velocity(prev, last);
    const acc = Math.abs(v1 - v2) / (last.time - first.time);

    if (acc >= 0.1) {
      return {
        acceleration: acc,
        finalVelocity: v2,
        finalPoint: last.point,
      };
    }
    return null;
  }

  /* end*/
}

function velocity(minit, mend) {
  const distance = mend.point.distanceTo(minit.point);
  const time = mend.time - minit.time;
  return distance / time;
}

module.exports = Swipe;


},{"../core/Gesture.js":3,"../core/util.js":9}],14:[function(require,module,exports){
/**
 * @file Tap.js
 * Contains the Tap class
 */

const Gesture = require('../core/Gesture.js');
const util    = require('../core/util.js');
const Point2D = require('../core/Point2D.js');

const DEFAULT_MIN_DELAY_MS = 0;
const DEFAULT_MAX_DELAY_MS = 300;
const DEFAULT_INPUTS = 1;
const DEFAULT_MOVE_PX_TOLERANCE = 10;

/**
 * A Tap is defined as a touchstart to touchend event in quick succession.
 *
 * @class Tap
 */
class Tap extends Gesture {
  /**
   * Constructor function for the Tap class.
   *
   * @param {Object} [options] - The options object.
   * @param {Number} [options.minDelay=0] - The minimum delay between a
   *    touchstart and touchend can be configured in milliseconds.
   * @param {Number} [options.maxDelay=300] - The maximum delay between a
   *    touchstart and touchend can be configured in milliseconds.
   * @param {Number} [options.numInputs=1] - Number of inputs for Tap gesture.
   * @param {Number} [options.tolerance=10] - The tolerance in pixels a user can
   *    move.
   */
  constructor(options = {}) {
    super('tap');

    /**
     * The minimum amount between a touchstart and a touchend can be configured
     * in milliseconds. The minimum delay starts to count down when the expected
     * number of inputs are on the screen, and ends when ALL inputs are off the
     * screen.  
     *
     * @type {Number}
     */
    this.minDelay = options.minDelay || DEFAULT_MIN_DELAY_MS;

    /**
     * The maximum delay between a touchstart and touchend can be configured in
     * milliseconds. The maximum delay starts to count down when the expected
     * number of inputs are on the screen, and ends when ALL inputs are off the
     * screen.
     *
     * @type {Number}
     */
    this.maxDelay = options.maxDelay || DEFAULT_MAX_DELAY_MS;

    /**
     * The number of inputs to trigger a Tap can be variable, and the maximum
     * number being a factor of the browser.
     *
     * @type {Number}
     */
    this.numInputs = options.numInputs || DEFAULT_INPUTS;

    /**
     * A move tolerance in pixels allows some slop between a user's start to end
     * events. This allows the Tap gesture to be triggered more easily.
     *
     * @type {number}
     */
    this.tolerance = options.tolerance || DEFAULT_MOVE_PX_TOLERANCE;

    /**
     * An array of inputs that have ended recently.
     */
    this.ended = [];
  }
  /* constructor*/

  /**
   * Event hook for the end of a gesture.  Determines if this the tap event can
   * be fired if the delay and tolerance constraints are met. Also waits for all
   * of the inputs to be off the screen before determining if the gesture is
   * triggered.
   *
   * @param {State} input status object
   *
   * @return {null|Object} - null if the gesture is not to be emitted, Object
   *    with information otherwise. Returns the interval time between start and
   *    end events.
   */
  end(state) {
    const now = Date.now();

    this.ended = this.ended.concat(state.getInputsInPhase('end'))
      .filter( i => {
        const tdiff = now - i.startTime;
        return tdiff <= this.maxDelay && tdiff >= this.minDelay;
      });

    if (this.ended.length === 0 ||
        this.ended.length !== this.numInputs || 
        !this.ended.every( i => i.totalDistanceIsWithin(this.tolerance))) {
      return null;
    }

    const {x,y} = Point2D.midpoint( this.ended.map( i => i.current.point ) );
    return {x,y};
  }
  /* end*/
}

module.exports = Tap;


},{"../core/Gesture.js":3,"../core/Point2D.js":5,"../core/util.js":9}]},{},[1])(1)
});