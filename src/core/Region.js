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
 * @class Region
 */
class Region {
  /**
   * Constructor function for the Region class.
   *
   * @param {Element} element - The element to capture all window events in that
   * region to feed into ZingTouch.
   * @param {boolean} [capture=false] - Whether the region listens for captures
   * or bubbles.
   * @param {boolean} [preventDefault=true] - Whether the default browser
   * functionality should be disabled;
   */
  constructor(element, capture = false, preventDefault = true) {
    /**
     * The list of relations between elements, their gestures, and the handlers.
     * @type {Binding}
     */
    this.bindings = [];

    /**
     * The element being bound to.
     * @type {Element}
     */
    this.element = element;

    /**
     * Whether the region listens for captures or bubbles.
     * @type {boolean}
     */
    this.capture = capture;

    /**
     * Boolean to disable browser functionality such as scrolling and zooming
     * over the region
     * @type {boolean}
     */
    this.preventDefault = preventDefault;

    /**
     * The internal state object for a Region.
     * Keeps track of inputs and bindings.
     * @type {State}
     */
    this.state = new State();

    this.activate();
  }

  /**
   * Begin operations.
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
      this.element.addEventListener(eventName, arbiter);
    });
  }

  /**
   * Function that handles event flow, negotiating with the interpreter, and
   * dispatcher.
   *
   * 1. Receiving all touch events in the window.
   * 2. Determining which gestures are linked to the target element.
   * 3. Negotiating with the Interpreter what event should occur.
   * 4. Sending events to the dispatcher to emit events to the target.
   *
   * @param {Event} event - The event emitted from the window object.
   */
  arbitrate(event) {
    if (this.preventDefault) event.preventDefault();

    this.state.updateAllInputs(event, this.element);

    this.getDispatchableGestureData(event, this.retrieveBindingsByInitialPos())
      .forEach( ({ binding, data }) => binding.dispatch(data) );

    this.state.clearEndedInputs();
  }

  /**
   * Calls the appropriate gesture hook for each binding. Filters out gestures
   * that returned null and packages the data from gestures that did not return
   * null such that it is ready for dispatching.
   */
  getDispatchableGestureData(event, bindings) {
    const hook = util.normalizeEvent[ event.type ];
    const events = this.state.getCurrentEvents();

    return bindings.reduce( (dispatchables, binding) => {
      const data = binding.gesture[hook](this.state.inputs, this.state);
      if (data) {
        data.events = events;
        dispatchables.push({ binding, data });
      }
      return dispatchables;
    }, []);
  }

  /**
   * Bind an element to a gesture with multiple function signatures.
   *
   * @example
   * bind(element) - chainable
   *
   * @example
   * bind(element, gesture, handler, [capture])
   *
   * @param {Element} element - The element object.
   * @param {String|Object} [gesture] - Gesture key, or a Gesture object.
   * @param {Function} [handler] - The function to execute when an event is
   * emitted.
   * @param {Boolean} [capture] - capture/bubble
   * @param {Boolean} [bindOnce = false] - Option to bind once and only emit the
   * event once.
   *
   * @return {Object} - a chainable object that has the same function as bind.
   */
  bind(element, gesture, handler, capture, bindOnce = false) {
    this.bindings.push(
      new Binding( element, gesture, handler, capture, bindOnce )
    );
  }

  /**
   * Retrieves the Binding by which an element is associated to.
   * @param {Element} element - The element to find bindings to.
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
      b => this.state.inputs.some( i => i && i.wasInitiallyInside(b.element) )
    );
  }

  /**
   * Unbinds an element from either the specified gesture or all if no element
   * is specified.
   *
   * @param {Element} element -The element to remove.
   * @param {String | Object} [gesture] - A String representing the gesture, or
   * the actual object being used.
   *
   * @return {Array} - An array of Bindings that were unbound to the element;
   */
  unbind(element, gesture) {
    let bindings = this.retrieveBindingsByElement(element);
    let unbound = [];

    bindings.forEach( b => {
      b.unbind();
      unbound.push(b);
      this.bindings.splice(this.bindings.indexOf(b), 1);
    });

    return unbound;
  }
  /* unbind*/
}

module.exports = Region;
