/**
 * @file Contains the {@link Input} class
 */

'use strict';

const PointerData = require('./PointerData.js');

/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events. Contains the progress of each Input and its associated
 * gestures.
 */
class Input {
  /**
   * Constructor function for the Input class.
   *
   * @param {(PointerEvent | MouseEvent | TouchEvent)} event - The input event
   *    which will initialize this Input object.
   * @param {Number} identifier - The identifier for this input, so that it can
   *    be located in subsequent Event objects.
   */
  constructor(event, identifier) {
    const currentData = new PointerData(event, identifier);

    /**
     * The set of elements along the original event's propagation path at the
     * time it was dispatched.
     *
     * @member {WeakSet.<Element>}
     */
    this.initialElements = getElementsInPath(event);

    /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @member {PointerData}
     */
    this.initial = currentData;

    /**
     * Holds the most current pointer data for this Input.
     *
     * @member {PointerData}
     */
    this.current = currentData;

    /**
     * Holds the previous pointer data for this Input.
     *
     * @member {PointerData}
     */
    this.previous = currentData;

    /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @member {Number}
     */
    this.identifier = identifier;

    /**
     * Stores internal state between events for each gesture based off of the
     * gesture's id.
     *
     * @member {Object}
     */
    this.progress = {};
  }

  /**
   * The phase of the input: 'start' or 'move' or 'end'
   *
   * @type {String} 
   */
  get phase() { return this.current.type; }

  /**
   * The timestamp of the initiating event for this input.
   *
   * @type {Number}
   */
  get startTime() { return this.initial.time; }

  /**
   * @param {String} id - The ID of the gesture whose progress is sought.
   * @return {Object} The progress of the gesture.
   */
  getProgressOfGesture(id) {
    if (!this.progress[id]) {
      this.progress[id] = {};
    }
    return this.progress[id];
  }

  /**
   * @return {Number} The distance between the initiating event for this input
   *    and its current event.
   */
  totalDistance() {
    return this.initial.distanceTo(this.current);
  }

  /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   * @return {undefined}
   */
  update(event) {
    this.previous = this.current;
    this.current = new PointerData(event, this.identifier);
  }

  /**
   * Determines if this PointerData was inside the given element at the time it
   * was dispatched.
   *
   * @param {Element} element
   * @return {Boolean} true if the PointerData occurred inside the element,
   *    false otherwise.
   */
  wasInitiallyInside(element) {
    return this.initialElements.has(element);
  }
}

/**
 * A WeakSet is used so that references will be garbage collected when the
 * element they point to is removed from the page.
 *
 * @private
 * @return {WeakSet.<Element>} The Elements in the path of the given event.
 */
function getElementsInPath(event) {
  return new WeakSet(getPropagationPath(event));
}

/**
 * In case event.composedPath() is not available.
 *
 * @private
 * @param {Event} event
 * @return {Element[]}
 */
function getPropagationPath(event) {
  if (typeof event.composedPath === 'function') {
    return event.composedPath();
  } 

  const path = [];
  for (let node = event.target; node !== document; node = node.parentNode) {
    path.push(node);
  }
  path.push(document);
  path.push(window);

  return path;
}

module.exports = Input;

