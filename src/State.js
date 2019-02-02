/*
 * Contains the {@link State} class
 */

'use strict';

const Input   = require('./Input.js');
const PHASE   = require('./PHASE.js');
const Point2D = require('./Point2D.js');

/**
 * Keeps track of currently active and ending input points on the interactive
 * surface.
 */
class State {
  /**
   * Constructor for the State class.
   */
  constructor() {
    /**
     * Keeps track of the current Input objects.
     *
     * @private
     * @type {Object}
     */
    this._inputs_obj = {};

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
     * @type {Point2D[]}
     */
    this.activePoints = [];

    /**
     * The centroid of the currently active points.
     *
     * @type {Point2D}
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
   * @return {undefined}
   */
  clearEndedInputs() {
    for (let k in this._inputs_obj) {
      if (this._inputs_obj[k].phase === 'end') delete this._inputs_obj[k];
    }
  }

  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   * @return {Input[]} Inputs in the given phase.
   */
  getInputsInPhase(phase) {
    return this.inputs.filter( i => i.phase === phase );
  }

  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   * @return {Input[]} Inputs <b>not</b> in the given phase.
   */
  getInputsNotInPhase(phase) {
    return this.inputs.filter( i => i.phase !== phase );
  }

  /**
   * @private
   * @param {Element} element - The Element to test.
   * @return {boolean} True if some input was initially inside the element.
   */
  someInputWasInitiallyInside(element) {
    return this.inputs.some( i => i.wasInitiallyInside(element) );
  }

  /**
   * Update the input with the given identifier using the given event.
   *
   * @private
   * @param {Event} event - The event being captured.
   * @param {number} identifier - The identifier of the input to update.
   * @return {undefined}
   */
  updateInput(event, identifier) {
    if (PHASE[ event.type ] === 'start') {
      this._inputs_obj[identifier] = new Input(event, identifier);
    } else if (this._inputs_obj[identifier]) {
      this._inputs_obj[identifier].update(event);
    }
  }

  /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @private
   * @param {Event} event - The event being captured. 
   * @return {undefined}
   */
  updateAllInputs(event) {
    update_fns[event.constructor.name].call(this, event);
    this.inputs = Object.values(this._inputs_obj);
    this.active = this.getInputsNotInPhase('end');
    this.activePoints = this.active.map( i => i.current.point );
    this.centroid = Point2D.midpoint( this.activePoints );
    this.event = event;
  }
}

/*
 * Set of helper functions for updating inputs based on type of input.
 * Must be called with a bound 'this', via bind(), or call(), or apply().
 * 
 * @private
 */
const update_fns = {
  TouchEvent: function(event) {
    Array.from(event.changedTouches).forEach( touch => {
      this.updateInput(event, touch.identifier);
    });
  },

  PointerEvent: function(event) {
    this.updateInput(event, event.pointerId);
  },

  MouseEvent: function(event) {
    this.updateInput(event, event.button);
  },
};

module.exports = State;

