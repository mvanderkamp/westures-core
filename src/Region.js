/*
 * Contains the Region class
 */

'use strict';

const State = require('./State.js');
const {
  CANCEL_EVENTS,
  KEYBOARD_EVENTS,
  MOUSE_EVENTS,
  POINTER_EVENTS,
  TOUCH_EVENTS,

  STATE_KEY_STRINGS,

  PHASE,

  START,
  END,
} = require('./constants.js');
const {
  setDifference,
  setFilter,
} = require('./utils.js');

/**
 * Allows the user to specify the control region which will listen for user
 * input events.
 *
 * @memberof westures-core
 *
 * @param {Element} element - The element which should listen to input events.
 * @param {object} [options]
 * @param {boolean} [options.capture=false] - Whether the region uses the
 * capture phase of input events. If false, uses the bubbling phase.
 * @param {boolean} [options.preventDefault=true] - Whether the default
 * browser functionality should be disabled. This option should most likely be
 * ignored. Here there by dragons if set to false.
 * @param {string} [options.source='page'] - One of 'page', 'client', or
 * 'screen'. Determines what the source of (x,y) coordinates will be from the
 * input events. ('X' and 'Y' will be appended, then those are the properties
 * that will be looked up).
 */
class Region {
  constructor(element, options = {}) {
    const settings = { ...Region.DEFAULTS, ...options };

    /**
     * The list of relations between elements, their gestures, and the handlers.
     *
     * @private
     * @type {Set.<Gesture>}
     */
    this.gestures = new Set();

    /**
     * The list of active gestures for the current input session.
     *
     * @private
     * @type {Set.<Gesture>}
     */
    this.activeGestures = new Set();

    /**
     * The base list of potentially active gestures for the current input
     * session.
     *
     * @private
     * @type {Set.<Gesture>}
     */
    this.potentialGestures = new Set();

    /**
     * The element being bound to.
     *
     * @private
     * @type {Element}
     */
    this.element = element;

    /**
     * Whether the region listens for captures or bubbles.
     *
     * @private
     * @type {boolean}
     */
    this.capture = settings.capture;

    /**
     * Whether the default browser functionality should be disabled. This option
     * should most likely be ignored. Here there by dragons if set to false.
     *
     * @private
     * @type {boolean}
     */
    this.preventDefault = settings.preventDefault;

    /**
     * Which X/Y attribute of input events should be used for determining input
     * locations.
     *
     * @private
     * @type {string}
     */
    this.source = settings.source;

    /**
     * The internal state object for a Region.  Keeps track of inputs.
     *
     * @private
     * @type {State}
     */
    this.state = new State(this.element, this.source);

    // Begin operating immediately.
    this.activate();
  }

  /**
   * Activates the region by adding event listeners for all appropriate input
   * events to the region's element.
   *
   * @private
   */
  activate() {
    /*
     * Having to listen to both mouse and touch events is annoying, but
     * necessary due to conflicting standards and browser implementations.
     * Pointer is a fallback for now instead of the primary, until I figure out
     * all the details to do with pointer-events and touch-action and their
     * cross browser compatibility.
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
    const arbitrate = this.arbitrate.bind(this);
    eventNames.forEach(eventName => {
      this.element.addEventListener(eventName, arbitrate, {
        capture: this.capture,
        once:    false,
        passive: false,
      });
    });

    const cancel = this.cancel.bind(this);
    CANCEL_EVENTS.forEach(eventName => {
      window.addEventListener(eventName, cancel);
    });

    const handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    KEYBOARD_EVENTS.forEach(eventName => {
      window.addEventListener(eventName, handleKeyboardEvent);
    });
  }

  /**
   * Handles a cancel event. Resets the state and the active / potential gesture
   * lists.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */
  cancel(event) {
    event.preventDefault();
    this.state = new State(this.element);
    this.resetActiveGestures();
  }

  /**
   * Handles a keyboard event, triggering a restart of any gestures that need
   * it.
   *
   * @private
   * @param {KeyboardEvent} event - The keyboard event.
   */
  handleKeyboardEvent(event) {
    if (STATE_KEY_STRINGS.indexOf(event.key) >= 0) {
      this.state.event = event;
      const oldActiveGestures = this.activeGestures;
      this.setActiveGestures();

      setDifference(oldActiveGestures, this.activeGestures).forEach(gesture => {
        gesture.evaluateHook(END, this.state);
      });
      setDifference(this.activeGestures, oldActiveGestures).forEach(gesture => {
        gesture.evaluateHook(START, this.state);
      });
    }
  }

  /**
   * Resets the active gestures.
   *
   * @private
   */
  resetActiveGestures() {
    this.potentialGestures = new Set();
    this.activeGestures = new Set();
  }

  /**
   * Selects active gestures from the list of potentially active gestures.
   *
   * @private
   */
  setActiveGestures() {
    this.activeGestures = setFilter(this.potentialGestures, gesture => {
      return gesture.isEnabled(this.state);
    });
  }

  /**
   * Selects the potentially active gestures.
   *
   * @private
   */
  setPotentialGestures() {
    const input = this.state.inputs[0];
    this.potentialGestures = setFilter(this.gestures, gesture => {
      return input.wasInitiallyInside(gesture.element);
    });
  }

  /**
   * Selects the gestures that are active for the current input sequence.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   * @param {boolean} isInitial - Whether this is an initial contact.
   */
  updateActiveGestures(event, isInitial) {
    if (PHASE[event.type] === START) {
      if (isInitial) {
        this.setPotentialGestures();
      }
      this.setActiveGestures();
    }
  }

  /**
   * Evaluates whether the current input session has completed.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */
  pruneActiveGestures(event) {
    if (PHASE[event.type] === END) {
      if (this.state.hasNoInputs()) {
        this.resetActiveGestures();
      } else {
        this.setActiveGestures();
      }
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
   */
  arbitrate(event) {
    const isInitial = this.state.hasNoInputs();
    this.state.updateAllInputs(event);
    this.updateActiveGestures(event, isInitial);

    if (this.activeGestures.size > 0) {
      if (this.preventDefault) event.preventDefault();

      this.activeGestures.forEach(gesture => {
        gesture.evaluateHook(PHASE[event.type], this.state);
      });
    }

    this.state.clearEndedInputs();
    this.pruneActiveGestures(event);
  }

  /**
   * Adds the given gesture to the region.
   *
   * @param {westures-core.Gesture} gesture - Instantiated gesture to add.
   */
  addGesture(gesture) {
    this.gestures.add(gesture);
  }

  /**
   * Removes the given gesture from the region.
   *
   * @param {westures-core.Gesture} gesture - Instantiated gesture to add.
   */
  removeGesture(gesture) {
    this.gestures.delete(gesture);
    this.potentialGestures.delete(gesture);
    this.activeGestures.delete(gesture);
  }

  /**
   * Retrieves Gestures by their associated element.
   *
   * @private
   *
   * @param {Element} element - The element for which to find gestures.
   *
   * @return {Gesture[]} Gestures to which the element is bound.
   */
  getGesturesByElement(element) {
    return setFilter(this.gestures, gesture => gesture.element === element);
  }

  /**
   * Remove all gestures bound to the given element.
   *
   * @param {Element} element - The element to unbind.
   */
  removeGesturesByElement(element) {
    this.getGesturesByElement(element).forEach(g => this.removeGesture(g));
  }
}

Region.DEFAULTS = Object.freeze({
  capture:        false,
  preventDefault: true,
  source:         'page',
});

module.exports = Region;

