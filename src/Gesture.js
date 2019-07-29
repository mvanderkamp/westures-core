/*
 * Contains the Gesture class
 */

'use strict';

let g_id = 0;

/**
 * One of ['ctrlKey', 'altKey', 'shiftKey', 'metaKey']
 *
 * @typedef {string} StateKey
 * @memberof westures-core.Gesture
 */

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
 * @param {westures-core.Gesture.StateKey[]} [options.enableKeys] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.Gesture.StateKey[]} [options.disableKeys] - List of
 * keys whicyh will disable the gesture. The gesture will not be recognized if
 * one of these keys is pressed. If not specified or an empty list, the gesture
 * is treated as though the disable key is never down.
 * @param {number} [options.minInputs] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs] - The maximum number of pointers that
 * may be active for the gesture to be recognized. Uses <=.
 */
class Gesture {
  constructor(type, element, handler, options = {}) {
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
     * The function handler to execute when the gesture is recognized on the
     * associated element.
     *
     * @type {Function}
     */
    this.handler = handler;

    /**
     * The options settings.
     *
     * @type {object}
     */
    this.options = { ...Gesture.DEFAULTS, ...options };
  }

  /**
   * Determines whether this gesture is enabled.
   *
   * @param {State} state - The input state object of the current region.
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
   * @param {State} state - The input state object of the current region.
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
   * @param {State} state - The input state object of the current region.
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
   * @param {State} state - The input state object of the current region.
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
   * @param {State} state - The input state object of the current region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */
  cancel() {
    return null;
  }

  /**
   * Evalutes the given gesture hook, and dispatches any data that is produced.
   *
   * @private
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {State} state - The current State instance.
   */
  evaluateHook(hook, state) {
    const data = this[hook](state);
    if (data) {
      this.handler({
        centroid: state.centroid,
        event:    state.event,
        phase:    hook,
        radius:   state.radius,
        type:     this.type,
        target:   this.element,
        ...data,
      });
    }
  }
}

Gesture.DEFAULTS = Object.freeze({
  enableKeys:  [],
  disableKeys: [],
  minInputs:   1,
  maxInputs:   Number.MAX_VALUE,
});

module.exports = Gesture;

