/*
 * Contains the Region class
 */

'use strict';

const State     = require('./State.js');
const {
  CANCEL_EVENTS,
  KEYBOARD_EVENTS,
  MOUSE_EVENTS,
  POINTER_EVENTS,
  TOUCH_EVENTS,

  STATE_KEYS,

  PHASE,

  START,
  END,
} = require('./constants.js');

/**
 * Performs an array minus operation.
 *
 * @private
 * @inner
 * @memberof westures-core.Region
 *
 * @param {Array} left
 * @param {Array} right
 *
 * @return {Array} Array consisting of elements in 'left' that are not in
 * 'right'.
 */
function arrayMinus(left, right) {
  return left.filter(p => right.indexOf(p) < 0);
}

/**
 * Determines whether the state of any of the STATE_KEYS has changed since the
 * last call.
 *
 * @private
 * @inner
 * @memberof westures-core.Region
 *
 * @param {Event} event - The event with STATE_KEYS properties to analyze.
 */
const stateKeysWereChanged = (function stateKeyFunctionFactory() {
  function stateKeysArray(event) {
    return STATE_KEYS.map(k => event[k]);
  }

  let currentKeys = stateKeysArray({});

  function stateKeysWereChanged(event) {
    const newKeys = stateKeysArray(event);
    const diff = newKeys.map((k, i) => k != currentKeys[i]);
    currentKeys = newKeys;
    return diff.some(k => k);
  }

  return stateKeysWereChanged;
}());

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
     * @type {Gesture[]}
     */
    this.gestures = [];

    /**
     * The list of active gestures for the current input session.
     *
     * @private
     * @type {Gesture[]}
     */
    this.activeGestures = [];

    /**
     * The base list of potentially active gestures for the current input
     * session.
     *
     * @private
     * @type {Gesture[]}
     */
    this.potentialGestures = [];

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

    KEYBOARD_EVENTS.forEach(eventName => {
      window.addEventListener(eventName, () => {
        this.setActiveGestures();
        this.activeGestures.forEach(gesture => {
          gesture.evaluateHook(START, this.state);
        });
      });
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
    if (stateKeysWereChanged(event)) {
      this.state.event = event;
      const oldActiveGestures = this.activeGestures.slice();
      this.setActiveGestures();

      arrayMinus(oldActiveGestures, this.activeGestures).forEach(gesture => {
        gesture.evaluateHook(END, this.state);
      });
      arrayMinus(this.activeGestures, oldActiveGestures).forEach(gesture => {
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
    this.potentialGestures = [];
    this.activeGestures = [];
  }

  /**
   * Selects active gestures from the list of potentially active gestures.
   *
   * @private
   */
  setActiveGestures() {
    this.activeGestures = this.potentialGestures.filter(gesture => {
      return gesture.isEnabled(this.state);
    });
  }

  /**
   * Selects the gestures that are active for the current input sequence.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */
  updateActiveGestures(event) {
    if (PHASE[event.type] === START) {
      if (this.state.inputs.length > 0) {
        const input = this.state.inputs[0];
        this.potentialGestures = this.gestures.filter(gesture => {
          return input.wasInitiallyInside(gesture.element);
        });
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
      if (this.state.hasNoActiveInputs()) {
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
    this.state.updateAllInputs(event);
    this.updateActiveGestures(event);

    if (this.activeGestures.length > 0) {
      if (this.preventDefault) event.preventDefault();

      this.activeGestures.forEach(gesture => {
        gesture.evaluateHook(PHASE[event.type], this.state);
      });
    }

    this.state.clearEndedInputs();
    this.pruneActiveGestures();
  }

  /**
   * Bind an element to a gesture with an associated handler.
   *
   * @param {westures-core.Gesture} gesture - Instantiated gesture to add.
   */
  addGesture(gesture) {
    this.gestures.push(gesture);
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
    return this.gestures.filter(b => b.element === element);
  }

  /**
   * Unbinds an element from either the specified gesture or all if no gesture
   * is specified.
   *
   * @param {Element} element - The element to unbind.
   * @param {westures-core.Gesture} [ gesture ] - The gesture to unbind. If
   * undefined, will unbind all Gestures associated with the given element.
   */
  removeGestures(element, gesture) {
    this.getGesturesByElement(element).forEach(b => {
      if (gesture == null || b.gesture === gesture) {
        this.gestures.splice(this.gestures.indexOf(b), 1);
      }
    });
  }
}

Region.DEFAULTS = Object.freeze({
  capture:        false,
  preventDefault: true,
  source:         'page',
});

module.exports = Region;

