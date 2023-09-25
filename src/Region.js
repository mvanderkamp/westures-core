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

  CANCEL,
  END,
  START,
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
 * @param {Element} [element=null] - The element which should listen to input
 * events. If not provided, will be set to the window unless operating in
 * "headless" mode.
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
 * @param {boolean} [options.headless=false] - Set to true to turn on "headless"
 * mode. This mode is intended for use outside of a browser environment. It does
 * not listen to window events, so instead you will have to send events directly
 * into the region. Pointer down/move/up events should be sent to
 * Region.arbitrate(event), cancel events should be sent to
 * Region.cancel(event), and keyboard events should be sent to
 * Region.handleKeyboardEvent(event). You do not need to supply an element to
 * the Region constructor in this mode, but you will still need to attach
 * elements to Gestures, and the events you pass in should specify event.target
 * appropriately, in order to select which gestures to run.
 */
class Region {
  constructor(element = null, options = {}) {
    options = { ...Region.DEFAULTS, ...options };
    if (element === null) {
      if (options.headless) {
        element = null;
      } else {
        element = window;
      }
    }

    /**
     * The gestures this region knows about.
     *
     * @type {Set.<westures-core.Gesture>}
     */
    this.gestures = new Set();

    /**
     * The list of active gestures for the current input session.
     *
     * @type {Set.<westures-core.Gesture>}
     */
    this.activeGestures = new Set();

    /**
     * The base list of potentially active gestures for the current input
     * session.
     *
     * @type {Set.<westures-core.Gesture>}
     */
    this.potentialGestures = new Set();

    /**
     * The element being bound to.
     *
     * @type {Element}
     */
    this.element = element;

    /**
     * The user-supplied options for the Region.
     *
     * @type {object}
     */
    this.options = options;

    /**
     * The internal state object for a Region.  Keeps track of inputs.
     *
     * @type {westures-core.State}
     */
    this.state = new State(this.element, options.headless);

    if (!options.headless) {
      // Begin operating immediately.
      this.activate();
    }
  }

  /**
   * Activates the region by adding event listeners for all appropriate input
   * events to the region's element.
   *
   * @private
   */
  activate() {
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
     */
    let eventNames = [];
    if (this.options.preferPointer && window.PointerEvent) {
      eventNames = POINTER_EVENTS;
    } else {
      eventNames = MOUSE_EVENTS.concat(TOUCH_EVENTS);
    }

    // Bind detected browser events to the region element.
    const arbitrate = this.arbitrate.bind(this);
    eventNames.forEach(eventName => {
      this.element.addEventListener(eventName, arbitrate, {
        capture: this.options.capture,
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
    if (
      this.options.preventDefault && typeof event.preventDefault === 'function'
    ) {
      event.preventDefault();
    }
    this.state.inputs.forEach(input => {
      input.update(event);
    });
    this.activeGestures.forEach(gesture => {
      gesture.evaluatePhase(CANCEL, this.state);
    });
    this.state = new State(this.element, this.options.headless);
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
        gesture.evaluatePhase(END, this.state);
      });
      setDifference(this.activeGestures, oldActiveGestures).forEach(gesture => {
        gesture.evaluatePhase(START, this.state);
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
      return input.initialElements.has(gesture.element);
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
      if (
        this.options.preventDefault &&
        typeof event.preventDefault === 'function'
      ) event.preventDefault();

      this.activeGestures.forEach(gesture => {
        gesture.evaluatePhase(PHASE[event.type], this.state);
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
    if (!this.options.headless) {
      gesture.element.style.touchAction = this.options.touchAction;
    }
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
   * @param {Element} element - The element for which to find gestures.
   *
   * @return {westures-core.Gesture[]} Gestures to which the element is bound.
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

Region.DEFAULTS = {
  capture:        false,
  preferPointer:  true,
  preventDefault: true,
  touchAction:    'none',
  headless:       false,
};

module.exports = Region;
