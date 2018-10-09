/**
 * @file Gesture.js
 * Contains the Gesture class
 */

let nextGestureNum = 0;

/**
 * The Gesture class that all gestures inherit from.
 * @class Gesture
 */
class Gesture {
  /**
   * Constructor function for the Gesture class.
   */
  constructor(type) {
    /**
     * The generic string type of gesture. (e.g. 'pan' or 'tap' or 'pinch').
     *
     * @type {String}
     */
    if (typeof type === 'undefined') throw 'Gestures require a type!';
    this.type = type;

    /**
     * The unique identifier for each gesture. This allows for distinctions
     * across instance variables of Gestures that are created on the fly (e.g.
     * gesture-tap-1, gesture-tap-2).
     *
     * @type {String}
     */
    this.id = `gesture-${this.type}-${nextGestureNum++}`;
  }

  /**
   * start() - Event hook for the start of a gesture
   *
   * @param {Object} state - The input state object of the current region.
   *
   * @return {null|Object}  - Default of null
   */
  start(state) {
    return null;
  }

  /**
   * move() - Event hook for the move of a gesture
   *
   * @param {Object} state - The input state object of the current region.
   *
   * @return {null|Object} - Default of null
   */
  move(state) {
    return null;
  }

  /**
   * end() - Event hook for the move of a gesture
   *
   * @param {Object} state - The input state object of the current region.
   *
   * @return {null|Object}  - Default of null
   */
  end(state) {
    return null;
  }
}

module.exports = Gesture;
