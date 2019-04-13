/*
 * Contains the abstract Pinch class.
 */

'use strict';

const rolling = Symbol('rolling');
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
     * @static
     * @memberof westures-core.Smoothable
     *
     * @type {function}
     * @param {object} data - The data to emit.
     */
    this.emit = null;
    if (options.hasOwnProperty('smoothing') && !options.smoothing) {
      this.emit = data => data;
    } else {
      this.emit = this[smooth].bind(this);
    }

    /**
     * The "identity" value of the data that will be smoothed.
     *
     * @private
     * @static
     * @memberof westures-core.Smoothable
     *
     * @type {*}
     */
    this.identity = 0;

    /**
     * Stage the emitted data once.
     *
     * @private
     * @static
     * @memberof westures-core.Smoothable
     *
     * @alias [@@rolling]
     * @type {object}
     */
    this[rolling] = this.identity;
  }

  /**
   * Restart the Smoothable gesture.
   *
   * @private
   * @memberof westures-core.Smoothable
   */
  restart() {
    this[rolling] = this.identity;
  }

  /**
   * Smooth out the outgoing data.
   *
   * @private
   * @memberof westures-core.Smoothable
   *
   * @param {object} next - The next batch of data to emit.
   * @param {string} field - The field to which smoothing should be applied.
   *
   * @return {?object}
   */
  [smooth](next, field) {
    const avg = this.smoothingAverage(this[rolling], next[field]);
    this[rolling] = avg;
    next[field] = avg;
    return next;
  }

  /**
   * Average out two values, as part of the smoothing algorithm.
   *
   * @private
   * @memberof westures-core.Smoothable
   *
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

