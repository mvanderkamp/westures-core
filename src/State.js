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

const symbols = {
  inputs: Symbol.for('inputs'),
};

/**
 * Keeps track of currently active and ending input points on the interactive
 * surface.
 *
 * @memberof westures-core
 *
 * @param {Element} element - The element underpinning the associated Region.
 * @param {boolean} [headless=false] - Whether westures is operating in
 * "headless" mode.
 */
class State {
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
     * Keeps track of the current Input objects.
     *
     * @alias [@@inputs]
     * @type {Map.<westures-core.Input>}
     * @memberof westure-core.State
     */
    this[symbols.inputs] = new Map();

    /**
     * All currently valid inputs, including those that have ended.
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
     * The centroid of the currently active points.
     *
     * @type {westures-core.Point2D}
     */
    this.centroid = {};

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
    this[symbols.inputs].forEach((v, k) => {
      if (v.phase === 'end') this[symbols.inputs].delete(k);
    });
  }

  /**
   * @return {westures-core.Input[]} Ended inputs.
   */
  getEndedInputs() {
    return this.inputs.filter(i => i.phase === 'end');
  }

  /**
   * @return {westures-core.Input[]} Active inputs.
   */
  getActiveInputs() {
    return this.inputs.filter(i => i.phase !== 'end');
  }

  /**
   * @return {boolean} True if there are no active inputs. False otherwise.
   */
  hasNoInputs() {
    return this[symbols.inputs].size === 0;
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
      this[symbols.inputs].set(
        identifier,
        new Input(event, identifier, this.headless),
      );
      if (!this.headless) {
        try {
          this.element.setPointerCapture(identifier);
        } catch (e) {
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
        } catch (e) {
          // NOP: Optional operation failed.
        }
      }
    case CANCEL:
    case MOVE:
      if (this[symbols.inputs].has(identifier)) {
        this[symbols.inputs].get(identifier).update(event);
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
    this.inputs = Array.from(this[symbols.inputs].values());
    this.active = this.getActiveInputs();
    this.activePoints = this.active.map(i => i.current.point);
    this.centroid = Point2D.centroid(this.activePoints);
    this.event = event;
  }
}

module.exports = State;

