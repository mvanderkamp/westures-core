/*
 * Contains the abstract Pinch class.
 */

'use strict';

const cascade = Symbol('cascade');
const smooth = Symbol('smooth');

/**
 * Determines whether to apply smoothing. Smoothing is on by default but turned
 * off if either:<br>
 *  1. The user explicitly requests that it be turned off.<br>
 *  2. The active pointer is not "coarse".<br>
 *
 * @see {@link
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia}
 *
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
      return true;
    }
  }
  return false;
}

/**
 * A Smoothable datatype is one that is capable of smoothing out a series of
 * values as they come in, one at a time, providing a more consistent series. It
 * does this by creating some inertia in the values using a cascading average.
 * (For those who are interested in such things, this effectively means that it
 * provides a practical application of Zeno's Dichotomy).
 *
 * @example
 * const x = new Smoothable({ identity: 1 });
 * const a = x.next(1);   // 1.0
 * const b = x.next(1.2); // 1.1
 * const c = x.next(0.9); // 1.0
 * const d = x.next(0.6); // 0.8
 * const e = x.next(1.2); // 1.0
 * const f = x.next(1.6); // 1.3
 * x.restart();
 * const g = x.next(0);   // 0.5
 *
 * @memberof westures-core
 *
 * @param {Object} [options]
 * @param {boolean} [options.applySmoothing=true] Whether to apply smoothing to
 * the data.
 * @param {*} [options.identity=0] The identity value of this smoothable data.
 */
class Smoothable {
  constructor(options = {}) {
    const final_options = { ...Smoothable.DEFAULTS, ...options };

    /**
     * The function through which smoothed emits are passed.
     *
     * @method
     * @param {*} data - The data to emit.
     *
     * @return {*} The smoothed out data.
     */
    this.next = null;
    if (smoothingIsApplicable(final_options.applySmoothing)) {
      this.next = this[smooth].bind(this);
    } else {
      this.next = data => data;
    }

    /**
     * The "identity" value of the data that will be smoothed.
     *
     * @type {*}
     * @default 0
     */
    this.identity = final_options.identity;

    /**
     * The cascading average of outgoing values.
     *
     * @memberof westures-core.Smoothable
     * @alias [@@cascade]
     * @type {object}
     */
    this[cascade] = this.identity;
  }

  /**
   * Restart the Smoothable gesture.
   */
  restart() {
    this[cascade] = this.identity;
  }

  /**
   * Smooth out the outgoing data.
   *
   * @memberof westures-core.Smoothable
   * @alias [@@smooth]
   * @param {object} data - The next batch of data to emit.
   *
   * @return {?object}
   */
  [smooth](data) {
    const average = this.average(this[cascade], data);
    this[cascade] = average;
    return average;
  }

  /**
   * Average out two values, as part of the smoothing algorithm. Override this
   * method if the data being smoothed is not a Number.
   *
   * @param {number} a
   * @param {number} b
   *
   * @return {number} The average of 'a' and 'b'
   */
  average(a, b) {
    return (a + b) / 2;
  }
}

Smoothable.DEFAULTS = Object.freeze({
  applySmoothing: true,
  identity:       0,
});

module.exports = Smoothable;

