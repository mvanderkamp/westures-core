/*
 * Contains the abstract Pinch class.
 */

'use strict';

const stagedEmit = Symbol('stagedEmit');
const smooth = Symbol('smooth');

/**
 * A Smoothable gesture is one that emits on 'move' events. It provides a
 * 'smoothing' option through its constructor, and will apply smoothing before
 * emitting. There will be a tiny, ~1/60th of a second delay to emits, as well
 * as a slight amount of drift over gestures sustained for a long period of
 * time.
 *
 * For a gesture to make use of smoothing, it must return `this.emit(data,
 * field)` from the `move` phase, instead of returning the data directly. If the
 * data being smoothed is not a simple number, it must also override the
 * `smoothingAverage(a, b)` method. Also you will probably want to call
 * `super.restart()` at some point in the `start`, `end`, and `cancel` phases.
 *
 * @memberof westures-core
 * @mixin
 */
const Smoothable = (superclass) => class Smoothable extends superclass {
  /**
   * @param {string} name - The name of the gesture.
   * @param {Object} [options]
   * @param {boolean} [options.smoothing=true] Whether to apply smoothing to
   * emitted data.
   */
  constructor(name, options = {}) {
    super(name, options);

    /**
     * The function through which emits are passed.
     *
     * @private
     * @type {function}
     */
    this.emit = null;
    if (options.hasOwnProperty('smoothing') && !options.smoothing) {
      this.emit = data => data;
    } else {
      this.emit = this[smooth].bind(this);
    }

    /**
     * Stage the emitted data once.
     *
     * @private
     * @type {object}
     */
    this[stagedEmit] = null;
  }

  /**
   * Restart the Smoothable gesture.
   */
  restart() {
    this[stagedEmit] = null;
  }

  /**
   * Smooth out the outgoing data.
   *
   * @private
   * @param {object} next - The next batch of data to emit.
   * @param {string] field - The field to which smoothing should be applied.
   *
   * @return {?object}
   */
  [smooth](next, field) {
    let result = null;

    if (this[stagedEmit]) {
      result = this[stagedEmit];
      const avg = this.smoothingAverage(result[field], next[field]);
      result[field] = avg;
      next[field] = avg;
    }

    this[stagedEmit] = next;
    return result;
  }

  /**
   * Average out two values, as part of the smoothing algorithm.
   *
   * @private
   * @param {number} a
   * @param {number} b
   *
   * @return {number} The average of 'a' and 'b'
   */
  smoothingAverage(a, b) {
    return (a + b) / 2;
  }
};

module.exports = Smoothable;

