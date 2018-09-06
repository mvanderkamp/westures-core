/**
 * @file Pan.js
 * Contains the Pan class
 */

const Gesture = require('./../core/classes/Gesture.js');
const Point2D = require('./../core/classes/Point2D.js');
const util    = require('./../core/util.js');

const DEFAULT_INPUTS = 1;
const DEFAULT_MIN_THRESHOLD = 1;

/**
 * A Pan is defined as a normal movement in any direction on a screen.
 * Pan gestures do not track start events and can interact with pinch and \
 *  expand gestures.
 * @class Pan
 */
class Pan extends Gesture {
  /**
   * Constructor function for the Pan class.
   * @param {Object} [options] - The options object.
   * @param {Number} [options.numInputs=1] - Number of inputs for the
   *  Pan gesture.
   * @param {Number} [options.threshold=1] - The minimum number of
   * pixels the input has to move to trigger this gesture.
   */
  constructor(options = {}) {
    super('pan');

    /**
     * The number of inputs to trigger a Pan can be variable,
     * and the maximum number being a factor of the browser.
     * @type {Number}
     */
    this.numInputs = options.numInputs || DEFAULT_INPUTS;

    /**
     * The minimum amount in pixels the pan must move until it is fired.
     * @type {Number}
     */
    this.threshold = options.threshold || DEFAULT_MIN_THRESHOLD;
  }

  /**
   * Event hook for the start of a gesture. Marks each input as active,
   * so it can invalidate any end events.
   * @param {Array} inputs
   */
  start(inputs, state) {
    const starting = state.getInputsInPhase('start');
    starting.forEach( input => {
      const progress = input.getProgressOfGesture(this.id);
      progress.lastEmitted = input.current.point.clone();
    });
  }
  /* start */

  /**
   * move() - Event hook for the move of a gesture.
   * Fired whenever the input length is met, and keeps a boolean flag that
   * the gesture has fired at least once.
   * @param {Array} inputs - The array of Inputs on the screen
   * @param {Object} state - The state object of the current region.
   * @return {Object} - Returns the distance in pixels between the two inputs.
   */
  move(inputs, state) {
    const active = state.getInputsNotInPhase('end');

    if (active.length !== this.numInputs) return null;

    const data = [];

    active.forEach( input => {
      const progress = input.getProgressOfGesture(this.id);
      const distanceFromLastEmit = progress.lastEmitted.distanceTo(
        input.current.point
      );
      const reachedThreshold = distanceFromLastEmit >= this.threshold;

      if (reachedThreshold) {
        data.push(packData( input, progress ));
        progress.lastEmitted = input.current.point.clone();
      } 
    });

    if (data.length > 0) return { data };
    return null;
  }
  /* move*/

  /**
   * end() - Event hook for the end of a gesture. If the gesture has at least
   * fired once, then it ends on the first end event such that any remaining
   * inputs will not trigger the event until all inputs have reached the
   * touchend event. Any touchend->touchstart events that occur before all
   * inputs are fully off the screen should not fire.
   * @param {Array} inputs - The array of Inputs on the screen
   * @return {null} - null if the gesture is not to be emitted,
   *  Object with information otherwise.
   */
  end(inputs, state) {
    const active = state.getInputsNotInPhase('end');
    active.forEach( input => {
      const progress = input.getProgressOfGesture(this.id);
      progress.lastEmitted = input.current.point.clone();
    });
    return null;
  }
  /* end*/
}

function packData( input, progress ) {
  const distanceFromOrigin = input.totalDistance();
  const directionFromOrigin = input.totalAngle();
  const point = input.current.point;
  const currentDirection = progress.lastEmitted.angleTo(point);
  const change = point.subtract(progress.lastEmitted);

  return {
    identifier: input.identifier,
    distanceFromOrigin,
    directionFromOrigin,
    currentDirection,
    change,
    point,
  };
}

module.exports = Pan;
