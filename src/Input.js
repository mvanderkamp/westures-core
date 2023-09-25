'use strict';

const PointerData = require('./PointerData.js');
const { getPropagationPath } = require('./utils.js');

/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events.
 *
 * @memberof westures-core
 *
 * @param {(PointerEvent | MouseEvent | TouchEvent)} event - The input event
 * which will initialize this Input object.
 * @param {number} identifier - The identifier for this input, so that it can
 * be located in subsequent Event objects.
 */
class Input {
  constructor(event, identifier, headless = false) {
    const currentData = new PointerData(event, identifier);

    /**
     * The set of elements along the original event's propagation path at the
     * time it was dispatched.
     *
     * @type {WeakSet.<Element>}
     */
    if (headless) {
      this.initialElements = new WeakSet([event.target]);
    } else {
      this.initialElements = new WeakSet(getPropagationPath(event));
    }

    /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @type {westures-core.PointerData}
     */
    this.initial = currentData;

    /**
     * Holds the most current pointer data for this Input.
     *
     * @type {westures-core.PointerData}
     */
    this.current = currentData;

    /**
     * Holds the previous pointer data for this Input.
     *
     * @type {westures-core.PointerData}
     */
    this.previous = currentData;

    /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @type {number}
     */
    this.identifier = identifier;
  }

  /**
   * The phase of the current input: 'start' or 'move' or 'end' or 'cancel'
   *
   * @type {string}
   */
  get phase() { return this.current.phase; }

  /**
   * The timestamp of the initiating event for this input.
   *
   * @type {number}
   */
  get startTime() { return this.initial.time; }

  /**
   * The amount of time elapsed between the start of this input and its latest
   * event.
   *
   * @type {number}
   */
  get elapsedTime() { return this.current.time - this.initial.time; }

  /**
   * @return {number} The distance between the initiating event for this input
   *    and its current event.
   */
  totalDistance() {
    return this.initial.point.distanceTo(this.current.point);
  }

  /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   */
  update(event) {
    this.previous = this.current;
    this.current = new PointerData(event, this.identifier);
  }
}

module.exports = Input;

