/**
 * @file Input.js
 */

const PointerData = require('./PointerData.js');

/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events.  Contains the progress of each Input and it's associated
 * gestures.
 *
 * @class Input
 */
class Input {
  /**
   * Constructor function for the Input class.
   *
   * @param {Event} event - The Event object from the window
   * @param {Number} [identifier=0] - The identifier for this input (taken
   *    from event.changedTouches or this input's button number)
   */
  constructor(event, identifier = 0) {
    const currentData = new PointerData(event, identifier);

    /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @type {PointerData}
     */
    this.initial = currentData;

    /**
     * Holds the most current pointer data for this Input.
     *
     * @type {PointerData}
     */
    this.current = currentData;

    /**
     * Holds the previous pointer data for this Input.
     *
     * @type {PointerData}
     */
    this.previous = currentData;

    /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @type {Number}
     */
    this.identifier = identifier;

    /**
     * Stores internal state between events for each gesture based off of the
     * gesture's id.
     *
     * @type {Object}
     */
    this.progress = {};
  }

  /**
   * @return {String} The phase of the input: 'start' or 'move' or 'end'
   */
  get phase()       { return this.current.type; }

  /**
   * @return {Number} The timestamp of the most current event for this input.
   */
  get currentTime() { return this.current.time; }

  /**
   * @return {Number} The timestamp of the initiating event for this input.
   */
  get startTime()   { return this.initial.time; }

  /**
   * @return {Point2D} A clone of the current point.
   */
  cloneCurrentPoint() {
    return this.current.point.clone();
  }

  /**
   * @return {Number} The angle in radians between the inputs' current events.
   */
  currentAngleTo(input) {
    return this.current.angleTo(input.current);
  }

  /**
   * Determines the distance between the current events for two inputs.
   *
   * @return {Number} The distance between the inputs' current events.
   */
  currentDistanceTo(input) {
    return this.current.distanceTo(input.current);
  }

  /**
   * @return {Number} The midpoint between the inputs' current events.
   */
  currentMidpointTo(input) {
    return this.current.midpointTo(input.current);
  }

  /**
   * @param {String} id - The identifier for each unique Gesture's progress.
   *
   * @return {Object} - The progress of the gesture.
   */
  getProgressOfGesture(id) {
    if (!this.progress[id]) {
      this.progress[id] = {};
    }
    return this.progress[id];
  }

  /**
   * @return {Number} The angle, in radians, between the initiating event for
   * this input and its current event.
   */
  totalAngle() {
    return this.initial.angleTo(this.current);
  }

  /**
   * @return {Number} The distance between the initiating event for this input
   * and its current event.
   */
  totalDistance() {
    return this.initial.distanceTo(this.current);
  }

  /**
   * @return {Boolean} true if the total distance is less than or equal to the
   * tolerance.
   */
  totalDistanceIsWithin(tolerance) {
    return this.totalDistance() <= tolerance;
  }

  /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   * @param {Number} touchIdentifier - The index of inputs, from event.touches
   */
  update(event) {
    this.previous = this.current;
    this.current = new PointerData(event, this.identifier);
  }

  /**
   * @return {Boolean} true if the given element existed along the propagation
   * path of this input's initiating event.
   */
  wasInitiallyInside(element) {
    return this.initial.wasInside(element);
  }
}

module.exports = Input;
