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

