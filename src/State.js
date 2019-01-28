/**
 * @file State.js
 */

'use strict';

const Input   = require('./Input.js');
const PHASE   = require('./PHASE.js');
const Point2D = require('./Point2D.js');

const DEFAULT_MOUSE_ID = 0;

/**
 * Creates an object related to a Region's state, and contains helper methods to
 * update and clean up different states.
 *
 * @class State
 */
class State {
  /**
   * Constructor for the State class.
   */
  constructor() {
    /**
     * Keeps track of the current Input objects.
     *
     * @type {Input}
     */
    this._inputs_obj = {};

    /**
     * All currently valid inputs, including those that have ended.
     */
    this.inputs = [];

    /**
     * The array of currently active inputs, sourced from the current Input
     * objects.
     *
     * "Active" is defined as not being in the 'end' phase.
     */
    this.active = [];

    /**
     * The array of latest point data for the currently active inputs, sourced
     * from this.active.
     */
    this.activePoints = [];

    /**
     * The centroid of the currently active points. Will be a Point2D.
     */
    this.centroid = {};

    /**
     * The latest event that the state processed.
     */
    this.event = null;
  }

  /**
   * Deletes all inputs that are in the 'end' phase.
   */
  clearEndedInputs() {
    for (let k in this._inputs_obj) {
      if (this._inputs_obj[k].phase === 'end') delete this._inputs_obj[k];
    }
  }

  /**
   * @return {Array} Current event for all inputs.
   */
  getCurrentEvents() {
    return this.inputs.map( i => i.current );
  }

  /**
   * @return {Array} Inputs in the given phase.
   */
  getInputsInPhase(phase) {
    return this.inputs.filter( i => i.phase === phase );
  }

  /**
   * @return {Array} Inputs _not_ in the given phase.
   */
  getInputsNotInPhase(phase) {
    return this.inputs.filter( i => i.phase !== phase );
  }

  /**
   * @return {Boolean} - true if some input was initially inside the element.
   */
  someInputWasInitiallyInside(element) {
    return this.inputs.some( i => i.wasInitiallyInside(element) );
  }

  /**
   * Update the input with the given identifier using the given event.
   *
   * @param {Event} event - The event being captured.
   * @param {Number} identifier - The identifier of the input to update.
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
   * @param {Event} event - The event being captured.  this current Region is
   *    bound to.
   *
   * @return {boolean} - returns true for a successful update, false if the
   *    event is invalid.
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

