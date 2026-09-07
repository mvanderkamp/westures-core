'use strict';

const {
  CANCEL,
  END,
  MOVE,
  PHASE,
  START,
  MOUSE_EVENTS,
  POINTER_EVENTS,
  TOUCH_EVENTS,
} = require('./constants.js');
const Input     = require('./Input.js');
const Point2D   = require('./Point2D.js');

/**
 * Keeps track of currently active and ending input points on the interactive
 * surface. An instance of this class is passed to each Gesture phase hook
 * ('start', 'move', 'end', 'cancel') when it is invoked.
 *
 * @example
 * // Inside a Gesture subclass's phase hook:
 * end(state) {
 *   const point = state.getInputsInPhase('end')[0].current.point;
 *   return { centroid: point, ...point };
 * }
 *
 * @memberof westures-core
 *
 * @param {Element} element - The element underpinning the associated Region.
 * @param {boolean} [headless=false] - Whether westures is operating in
 * "headless" mode.
 */
class State {
  /**
   * Definitive record of the current Input objects, with O(1) lookup by
   * identifier.
   *
   * @type {Map.<westures-core.Input>}
   */
  #inputsById = new Map();

  constructor(element, headless = false) {
    /**
     * Keep a reference to the element for the associated region.
     *
     * @type {Element}
     */
    this.element = element;

    /**
     * Whether westures is operating in "headless" mode.
     *
     * @type {boolean}
     */
    this.headless = headless;

    /**
     * Short-lived snapshot of all currently valid inputs, including those that
     * have ended. Refreshed via updateFields() on each processed event; may be
     * stale between calls to updateAllInputs().
     *
     * @type {westures-core.Input[]}
     */
    this.inputs = [];

    /**
     * The array of currently active inputs, sourced from the current Input
     * objects. "Active" is defined as not being in the 'end' phase.
     *
     * @type {westures-core.Input[]}
     */
    this.active = [];

    /**
     * The array of latest point data for the currently active inputs, sourced
     * from this.active.
     *
     * @type {westures-core.Point2D[]}
     */
    this.activePoints = [];

    /**
     * The centroid of the currently active points, or null when there are no
     * active inputs (such as during the final end event).
     *
     * @type {?westures-core.Point2D}
     */
    this.centroid = null;

    /**
     * The latest event that the state processed.
     *
     * @type {Event}
     */
    this.event = null;
  }

  /**
   * Deletes all inputs that are in the 'end' phase.
   */
  clearEndedInputs() {
    this.#inputsById.forEach((v, k) => {
      if (v.phase === 'end') this.#inputsById.delete(k);
    });
  }

  /**
   * Retrieves all currently tracked inputs that are in the given phase.
   *
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {westures-core.Input[]} Inputs in the given phase.
   */
  getInputsInPhase(phase) {
    return this.inputs.filter(i => i.phase === phase);
  }

  /**
   * Retrieves all currently tracked inputs that are not in the given phase.
   *
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {westures-core.Input[]} Inputs <b>not</b> in the given phase.
   */
  getInputsNotInPhase(phase) {
    return this.inputs.filter(i => i.phase !== phase);
  }

  /**
   * Determines whether there are currently any active inputs being tracked.
   *
   * @return {boolean} True if there are no active inputs. False otherwise.
   */
  hasNoInputs() {
    return this.#inputsById.size === 0;
  }

  /**
   * Retrieves the currently tracked input with the given identifier, if any.
   *
   * @param {number} identifier - The identifier of the input to retrieve.
   *
   * @return {?westures-core.Input} The input with the given identifier, or
   * undefined if no such input is being tracked.
   */
  getInput(identifier) {
    return this.#inputsById.get(identifier);
  }

  /**
   * Update the input with the given identifier using the given event.
   *
   * @private
   *
   * @param {Event} event - The event being captured.
   * @param {number} identifier - The identifier of the input to update.
   */
  updateInput(event, identifier) {
    switch (PHASE[event.type]) {
    case START:
      this.#inputsById.set(
        identifier,
        new Input(event, identifier, this.headless),
      );
      if (!this.headless) {
        try {
          this.element.setPointerCapture(identifier);
        } catch (e) {  // eslint-disable-line
          // NOP: Optional operation failed.
        }
      }
      break;

    // All of 'end', 'move', and 'cancel' perform updates, hence the
    // following fall-throughs
    case END:
      if (!this.headless) {
        try {
          this.element.releasePointerCapture(identifier);
        } catch (e) {  // eslint-disable-line
          // NOP: Optional operation failed.
        }
      }
    case CANCEL:
    case MOVE:
      if (this.#inputsById.has(identifier)) {
        this.#inputsById.get(identifier).update(event);
      }
      break;

    default:
      console.warn(`Unrecognized event type: ${event.type}`);
    }
  }

  /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @private
   * @param {Event} event - The event being captured.
   */
  updateAllInputs(event) {
    if (POINTER_EVENTS.includes(event.type)) {
      this.updateInput(event, event.pointerId);
    } else if (MOUSE_EVENTS.includes(event.type)) {
      if (event.button === 0) {
        this.updateInput(event, event.button);
      }
    } else if (TOUCH_EVENTS.includes(event.type)) {
      Array.from(event.changedTouches).forEach(touch => {
        this.updateInput(event, touch.identifier);
      });
    } else {
      throw new Error(`Unexpected event type: ${event.type}`);
    }
    this.updateFields(event);
  }

  /**
   * Updates the convenience fields.
   *
   * @private
   * @param {Event} event - Event with which to update the convenience fields.
   */
  updateFields(event) {
    this.inputs = Array.from(this.#inputsById.values());
    this.active = this.getInputsNotInPhase('end');
    this.activePoints = this.active.map(i => i.current.point);
    this.centroid = Point2D.centroid(this.activePoints);
    this.event = event;
  }
}

module.exports = State;
