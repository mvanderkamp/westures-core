(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.westuresCore = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * @file index.js
 * Main object containing API methods and Gesture constructors
 */

const Region  = require('./src/Region.js');
const Point2D = require('./src/Point2D.js');
const Gesture = require('./src/Gesture.js');

/**
 * The global API interface for Westures. Contains a constructor for the Region
 * Object and the generic Gesture class for user gestures to implement.
 *
 * @type {Object}
 * @namespace Westures
 */
module.exports = {
  Gesture,
  Point2D,
  Region,
};


},{"./src/Gesture.js":3,"./src/Point2D.js":6,"./src/Region.js":8}],2:[function(require,module,exports){
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
  }

  /**
   * Evalutes the given gesture hook, and dispatches any data that is produced.
   */
  evaluateHook(hook, state, events) {
    const data = this.gesture[hook](state);
    if (data) {
      data.events = events;
      this.handler(data);
    }
  }
}

module.exports = Binding;


},{}],3:[function(require,module,exports){
/**
 * @file Gesture.js
 * Contains the Gesture class
 */

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


},{}],4:[function(require,module,exports){
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


},{"./PointerData.js":7}],5:[function(require,module,exports){
/**
 * @file PHASE.js
 */

/**
 * Normalizes window events to be either of type start, move, or end.
 *
 * @param {String} type - The event type emitted by the browser
 *
 * @return {null|String} - The normalized event, or null if it is an event not
 *    predetermined.
 */
const PHASE = Object.freeze({
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
/* PHASE*/

module.exports = PHASE;


},{}],6:[function(require,module,exports){
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
  minus(point) {
    return new Point2D(
      this.x - point.x,
      this.y - point.y
    );
  }

  /**
   * Return the summation of this point to the given point.
   *
   * @param {Point2D} point
   *
   * @return {Point2D} A new Point2D, which is the addition of the two points.
   */
  plus(point) {
    return new Point2D(
      this.x + point.x,
      this.y + point.y,
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
  return points.reduce( (total, pt) => total.plus(pt), new Point2D(0,0) );
}

module.exports = Point2D;


},{}],7:[function(require,module,exports){
/**
 * @file PointerData.js
 * Contains logic for PointerDatas
 */

const Point2D = require('./Point2D.js');
const PHASE   = require('./PHASE.js');

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
    this.initialElements = getElementsInPath(event);

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
    this.type = PHASE[ event.type ];

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
 * A WeakSet is used so that references will be garbage collected when the
 * element they point to is removed from the page.
 *
 * @return {WeakSet} The Elements in the path of the given event.
 */
function getElementsInPath(event) {
  return new WeakSet(getPropagationPath(event));
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

module.exports = PointerData;


},{"./PHASE.js":5,"./Point2D.js":6}],8:[function(require,module,exports){
/**
 * @file Region.js
 */

const Binding = require('./Binding.js');
const State   = require('./State.js');
const PHASE   = require('./PHASE.js');

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
 * Allows the user to specify the control region which will listen for user
 * input events.
 *
 * @class Region
 */
class Region {
  /**
   * Constructor function for the Region class.
   *
   * @param {Element} element - The element which should listen to input events.
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
    /*
     * Having to listen to both mouse and touch events is annoying, but
     * necessary due to conflicting standards and browser implementations.
     * Pointer is a fallback instead of the primary because it lacks useful
     * properties such as 'ctrlKey' and 'altKey'.
     *
     * Listening to both mouse and touch comes with the difficulty that
     * preventDefault() must be called to prevent both events from iterating
     * through the system. However I have left it as an option to the end user,
     * which defaults to calling preventDefault(), in case there's a use-case I
     * haven't considered or am not aware of.
     *
     * It is also a good idea to keep regions small in large pages.
     *
     * See:
     *  https://www.html5rocks.com/en/mobile/touchandmouse/
     *  https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
     *  https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
     */
    let eventNames = [];
    if (window.TouchEvent || window.MouseEvent) {
      eventNames = MOUSE_EVENTS.concat(TOUCH_EVENTS);
    } else {
      eventNames = POINTER_EVENTS;
    }

    // Bind detected browser events to the region element.
    const arbiter = this.arbitrate.bind(this);
    eventNames.forEach( eventName => {
      this.element.addEventListener(eventName, arbiter, {
        capture: this.capture,
        once: false,
        passive: false,
      });
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

    const hook = PHASE[ event.type ];
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
   * @param {Gesture} gesture - Gesture type with which to bind.
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
        this.bindings.splice(this.bindings.indexOf(b), 1);
        unbound.push(b);
      }
    });

    return unbound;
  }
  /* unbind*/
}

module.exports = Region;


},{"./Binding.js":2,"./PHASE.js":5,"./State.js":9}],9:[function(require,module,exports){
/**
 * @file State.js
 */

const Input   = require('./Input.js');
const PHASE   = require('./PHASE.js');

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
    if (PHASE[ event.type ] === 'start') {
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

module.exports = State;


},{"./Input.js":4,"./PHASE.js":5}]},{},[1])(1)
});
