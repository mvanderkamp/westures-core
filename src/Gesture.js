/*
 * Contains the {@link Gesture} class
 */

'use strict';

let nextGestureNum = 0;

/**
 * The Gesture class that all gestures inherit from.
 */
class Gesture {
  /**
   * Constructor function for the Gesture class.
   */
  constructor(type) {
    /**
     * The type or name of the gesture. (e.g. 'pan' or 'tap' or 'pinch').
     *
     * @type {string}
     */
    if (typeof type === 'undefined') throw 'Gestures require a type!';
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
   * Event hook for the start of a gesture.
   *
   * @param {State} state - The input state object of the current region.
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */
  start(state) {
    return void state;
  }

  /**
   * Event hook for the move of a gesture.
   *
   * @param {State} state - The input state object of the current region.
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */
  move(state) {
    return void state;
  }

  /**
   * Event hook for the move of a gesture.
   *
   * @param {State} state - The input state object of the current region.
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */
  end(state) {
    return void state;
  }
}

module.exports = Gesture;

