/*
 * Contains the {@link State} class
 */

'use strict';

const {
  CANCEL,
  END,
  MOVE,
  PHASE,
  START,
} = require('./constants.js');
const Input     = require('./Input.js');
const Point2D   = require('./Point2D.js');

const symbols = Object.freeze({
  inputs: Symbol.for('inputs'),
});

/**
 * Set of helper functions for updating inputs based on type of input.
 * Must be called with a bound 'this', via bind(), or call(), or apply().
 *
 * @private
 * @inner
 * @memberof State
 */
const update_fns = {
  TouchEvent: function TouchEvent(event) {
    Array.from(event.changedTouches).forEach(touch => {
      this.updateInput(event, touch.identifier);
    });
  },

  PointerEvent: function PointerEvent(event) {
    this.updateInput(event, event.pointerId);
  },

  MouseEvent: function MouseEvent(event) {
    if (event.button === 0) {
      this.updateInput(event, event.button);
    }
  },
};

/**
 * Keeps track of currently active and ending input points on the interactive
 * surface.
 *
 * @param {Element} element - The element underpinning the associated Region.
 * @param {string} [source='page'] - One of 'page', 'client', or 'screen'.
 * Determines what the source of (x,y) coordinates will be from the input
 * events. ('X' and 'Y' will be appended, then those are the properties that
 * will be looked up).
 */
class State {
  constructor(element, source) {
    /**
     * Keep a reference to the element for the associated region.
     *
     * @private
     * @type {Element}
     */
    this.element = element;

    /**
     * Which X/Y attributes of input events to look up for determining input
     * location.
     *
     * @private
     * @type {string}
     */
    this.source = source;

    /**
     * Keeps track of the current Input objects.
     *
     * @private
     * @alias [@@inputs]
     * @type {Map.<Input>}
     * @memberof State
     */
    this[symbols.inputs] = new Map();

    /**
     * All currently valid inputs, including those that have ended.
     *
     * @type {Input[]}
     */
    this.inputs = [];

    /**
     * The array of currently active inputs, sourced from the current Input
     * objects. "Active" is defined as not being in the 'end' phase.
     *
     * @type {Input[]}
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
   *
   * @private
   */
  clearEndedInputs() {
    this[symbols.inputs].forEach((v, k) => {
      if (v.phase === 'end') this[symbols.inputs].delete(k);
    });
  }

  /**
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {Input[]} Inputs in the given phase.
   */
  getInputsInPhase(phase) {
    return this.inputs.filter(i => i.phase === phase);
  }

  /**
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {Input[]} Inputs <b>not</b> in the given phase.
   */
  getInputsNotInPhase(phase) {
    return this.inputs.filter(i => i.phase !== phase);
  }

  /**
   * @private
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
        new Input(event, identifier, this.source)
      );
      try {
        this.element.setPointerCapture(identifier);
      } catch (e) {
        // NOP: Optional operation failed.
      }
      break;
    case END:
      try {
        this.element.releasePointerCapture(identifier);
      } catch (e) {
        // NOP: Optional operation failed.
      }
      // All of 'end', 'move', and 'cancel' perform updates, hence the
      // following fall-throughs
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
    update_fns[event.constructor.name].call(this, event);
    this.updateFields(event);
  }

  /**
   * Updates the convenience fields.
   *
   * @private
   * @param {Event} event - Event with which to update the convenience fields.
   */
  updateFields(event) {
    this.inputs = Array.from(this[symbols.inputs].values());
    this.active = this.getInputsNotInPhase('end');
    this.activePoints = this.active.map(i => i.current.point);
    this.centroid = Point2D.centroid(this.activePoints);
    // XXX: Delete this.radius for next released. It is not generally useful.
    this.radius = this.activePoints.reduce((acc, cur) => {
      const dist = cur.distanceTo(this.centroid);
      return dist > acc ? dist : acc;
    }, 0);
    if (event) this.event = event;
  }
}

module.exports = State;

