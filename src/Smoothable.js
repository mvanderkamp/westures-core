/*
 * Contains the abstract Pinch class.
 */

'use strict';

const cascade = Symbol('cascade');
const smooth = Symbol('smooth');

/**
 * Determines whether to apply smoothing. Smoothing is on by default but turned
 * off if either:
 *  1. The user explicitly requests that it be turned off.
 *  2. The active poiner is not "coarse".
 *
 * @see {@link
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia}
 *
 * @private
 * @inner
 * @memberof westures-core.Smoothable
 *
 * @param {boolean} isRequested - Whether smoothing was requested by the user.
 *
 * @returns {boolean} Whether to apply smoothing.
 */
function smoothingIsApplicable(isRequested = true) {
  if (isRequested) {
    try {
      return window.matchMedia('(pointer: coarse)').matches;
    } catch (e) {
      console.warn(e);
    }
    return true;
  }
  return false;
}

/**
 * A Smoothable gesture is one that emits on 'move' events. It provides a
 * 'smoothing' option through its constructor, and will apply smoothing before
 * emitting. There will be a tiny, ~1/60th of a second delay to emits, as well
 * as a slight amount of drift over gestures sustained for a long period of
 * time.
 *
 * For a gesture to make use of smoothing, it must return `this.smooth(data,
 * field)` from the `move` phase, instead of returning the data directly. If the
 * data being smoothed is not a simple number, it must also override the
 * `smoothingAverage(a, b)` method. Also you will probably want to call
 * `super.restart()` at some point in the `start`, `end`, and `cancel` phases.
 *
 * @memberof westures-core
 * @mixin
 *
 * @param {string} name - The name of the gesture.
 * @param {Object} [options]
 * @param {boolean} [options.smoothing=true] Whether to apply smoothing to
 * emitted data.
 */
const Smoothable = (superclass) => class Smoothable extends superclass {
  constructor(name, options = {}) {
    super(name, options);

    /**
     * The function through which smoothed emits are passed.
     *
     * @memberof westures-core.Smoothable
     *
     * @type {function}
     * @param {object} data - The data to emit.
     */
    this.smooth = null;
    if (smoothingIsApplicable(options.smoothing)) {
      this.smooth = this[smooth].bind(this);
    } else {
      this.smooth = data => data;
    }

    /**
     * The "identity" value of the data that will be smoothed.
     *
     * @memberof westures-core.Smoothable
     *
     * @type {*}
     * @default 0
     */
    this.identity = 0;

    /**
     * Stage the emitted data once.
     *
     * @private
     * @static
     * @memberof westures-core.Smoothable
     *
     * @alias [@@cascade]
     * @type {object}
     */
    this[cascade] = this.identity;
  }

  /**
   * Restart the Smoothable gesture.
   *
   * @memberof westures-core.Smoothable
   */
  restart() {
    this[cascade] = this.identity;
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
    const avg = this.smoothingAverage(this[cascade], next[field]);
    this[cascade] = avg;
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

