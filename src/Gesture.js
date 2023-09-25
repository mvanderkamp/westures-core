'use strict';

const { PHASES } = require('./constants.js');

let g_id = 0;

/**
 * The Gesture class that all gestures inherit from. A custom gesture class will
 * need to override some or all of the four phase "hooks": start, move, end, and
 * cancel.
 *
 * @memberof westures-core
 *
 * @param {string} type - The name of the gesture.
 * @param {Element} element - HTML element to interact with.
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
 */
class Gesture {
  constructor(type, element, options = {}) {
    if (typeof type !== 'string') {
      throw new TypeError('Gestures require a string type / name');
    }

    /**
     * The name of the gesture. (e.g. 'pan' or 'tap' or 'pinch').
     *
     * @type {string}
     */
    this.type = type;

    /**
     * The unique identifier for each gesture. This allows for distinctions
     * across instances of Gestures that are created on the fly (e.g.
     * gesture-tap-1, gesture-tap-2).
     *
     * @type {string}
     */
    this.id = `gesture-${this.type}-${g_id++}`;

    /**
     * The element to which to associate the gesture.
     *
     * @type {Element}
     */
    this.element = element;

    /**
     * Event listeners.
     *
     * @type {Map.<Element>}
     * @private
     */
    this.listeners = new Map();
    PHASES.forEach(phase => this.listeners.set(phase, []));

    /**
     * The options. Can usually be adjusted live, though be careful doing this.
     *
     * @type {object}
     */
    this.options = { ...Gesture.DEFAULTS, ...options };
  }

  /**
   * Determines whether this gesture is enabled.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {boolean} true if enabled, false otherwise.
   */
  isEnabled(state) {
    const count = state.active.length;
    const event = state.event;
    const { enableKeys, disableKeys, minInputs, maxInputs } = this.options;

    return (minInputs <= count) && (maxInputs >= count) &&
      (enableKeys.length === 0 || enableKeys.some(k => event[k])) &&
      !disableKeys.some(k => event[k]);
  }

  /**
   * Event hook for the start phase of a gesture.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */
  start() {
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
   */
  move() {
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
   */
  end() {
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
   */
  cancel() {
    return null;
  }

  /**
   * Evalutes the given gesture hook, and dispatches any data that is produced
   * by calling [recognize]{@link westures-core.Gesture#recognize}.
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {westures-core.State} state - The current State instance.
   */
  evaluateHook(hook, state) {
    const data = this[hook](state);
    if (data) {
      this.recognize(hook, state, data);
    }
  }

  /**
   * Add a listener.
   *
   * @param {string} phase
   * @param {function} listener
   */
  addListener(phase, listener) {
    this.listeners.get(phase).push(listener);
  }

  /**
   * Remove a listener.
   *
   * @param {string} phase
   * @param {function} listener
   */
  removeListener(phase, listener) {
    const phase_listeners = this.listeners.get(phase);
    phase_listeners.splice(phase_listeners.indexOf(listener), 1);
  }

  /**
   * Recognize a Gesture by calling the listeners. Standardizes the way the
   * listeners are called so that classes extending Gesture can circumvent the
   * evaluateHook approach but still provide results that have a common format.
   *
   * Note that the properties in the "data" object will receive priority when
   * constructing the results. This can be used to override standard results
   * such as the phase or the centroid.
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {westures-core.State} state - current input state.
   * @param {Object} data - Results data specific to the recognized gesture.
   */
  recognize(hook, state, data) {
    // Take a copy of the listeners so to make sure they won't be interfered
    // with while processing user code.
    const listeners = Array.from(this.listeners.get(hook));
    listeners.forEach(listener => listener({
      centroid: state.centroid,
      event:    state.event,
      phase:    hook,
      type:     this.type,
      target:   this.element,
      ...data,
    }));
  }
}

Gesture.DEFAULTS = {
  enableKeys:  [],
  disableKeys: [],
  minInputs:   1,
  maxInputs:   Number.MAX_VALUE,
};

module.exports = Gesture;

