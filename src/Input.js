/*
 * Contains the {@link Input} class
 */

'use strict';

const PointerData = require('./PointerData.js');

/**
 * In case event.composedPath() is not available.
 *
 * @private
 * @inner
 * @memberof Input
 *
 * @param {Event} event
 *
 * @return {Element[]} The elements along the composed path of the event.
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

/**
 * A WeakSet is used so that references will be garbage collected when the
 * element they point to is removed from the page.
 *
 * @private
 * @inner
 * @memberof Input
 * @return {WeakSet.<Element>} The Elements in the path of the given event.
 */
function getElementsInPath(event) {
  return new WeakSet(getPropagationPath(event));
}

/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events. Contains the progress of each Input and its associated
 * gestures.
 *
 * @param {(PointerEvent | MouseEvent | TouchEvent)} event - The input event
 * which will initialize this Input object.
 * @param {number} identifier - The identifier for this input, so that it can
 * be located in subsequent Event objects.
 * @param {string} [source='page'] - One of 'page', 'client', or 'screen'.
 * Determines what the source of (x,y) coordinates will be from the input
 * events. ('X' and 'Y' will be appended, then those are the properties that
 * will be looked up).
 */
class Input {
  constructor(event, identifier, source) {
    const currentData = new PointerData(event, identifier, source);

    /**
     * Which X/Y attributes of input events to look up for determining input
     * location.
     *
     * @private
     * @type {string}
     */
    this.source = source;

    /**
     * The set of elements along the original event's propagation path at the
     * time it was dispatched.
     *
     * @private
     * @type {WeakSet.<Element>}
     */
    this.initialElements = getElementsInPath(event);

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
     * @type {number}
     */
    this.identifier = identifier;

    /**
     * Stores internal state between events for each gesture based off of the
     * gesture's id.
     *
     * @private
     * @type {Object}
     */
    this.progress = {};
  }

  /**
   * The phase of the input: 'start' or 'move' or 'end' or 'cancel'
   *
   * @type {string}
   */
  get phase() { return this.current.type; }

  /**
   * The timestamp of the initiating event for this input.
   *
   * @type {number}
   */
  get startTime() { return this.initial.time; }

  /**
   * @private
   *
   * @param {string} id - The ID of the gesture whose progress is sought.
   *
   * @return {Object} The progress of the gesture.
   */
  getProgressOfGesture(id) {
    if (!this.progress[id]) {
      this.progress[id] = {};
    }
    return this.progress[id];
  }

  /**
   * @return {number} The distance between the initiating event for this input
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
   * @private
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   */
  update(event) {
    this.previous = this.current;
    this.current = new PointerData(event, this.identifier, this.source);
  }

  /**
   * Determines if this PointerData was inside the given element at the time it
   * was dispatched.
   *
   * @private
   *
   * @param {Element} element
   *
   * @return {boolean} true if the Input began inside the element, false
   *    otherwise.
   */
  wasInitiallyInside(element) {
    return this.initialElements.has(element);
  }
}

module.exports = Input;

