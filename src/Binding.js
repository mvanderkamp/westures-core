/**
 * @file Contains the {@link Binding} class.
 */

'use strict';

/**
 * A Binding associates a gesture with an element and a handler function that
 * will be called when the gesture is recognized.
 */
class Binding {
  /**
   * Constructor function for the Binding class.
   *
   * @param {Element} element - The element to which to associate the gesture.
   * @param {Gesture} gesture - A instance of the Gesture type.
   * @param {Function} handler - The function handler to execute when a gesture
   *    is recognized on the associated element.
   */
  constructor(element, gesture, handler) {
    /**
     * The element to which to associate the gesture.
     *
     * @member {Element}
     */
    this.element = element;

    /**
     * The gesture to associate with the given element.
     *
     * @member {Gesture}
     */
    this.gesture = gesture;

    /**
     * The function handler to execute when the gesture is recognized on the
     * associated element.
     *
     * @member {Function}
     */
    this.handler = handler;
  }

  /**
   * Evalutes the given gesture hook, and dispatches any data that is produced.
   *
   * @param {String} hook - which gesture hook to call, must be one of 'start', 
   *    'move', or 'end'.
   * @param {State} state - The current State instance.
   * @return {undefined}
   */
  evaluateHook(hook, state) {
    const data = this.gesture[hook](state);
    if (data) {
      data.phase = hook;
      data.event = state.event;
      data.type = this.gesture.type;
      this.handler(data);
    }
  }
}

module.exports = Binding;

