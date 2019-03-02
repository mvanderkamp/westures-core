/*
 * Contains the {@link Gesture} class
 */

'use strict';

let nextGestureNum = 0;

/**
 * The Gesture class that all gestures inherit from.
 *
 * @memberof westures-core
 */
class Gesture {
  /**
   * Constructor function for the Gesture class.
   *
   * @param {string} type - The name of the gesture.
   */
  constructor(type) {
    if (typeof type !== 'string') {
      throw new TypeError('Gestures require a string type');
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
    this.id = `gesture-${this.type}-${nextGestureNum++}`;
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
}

module.exports = Gesture;

