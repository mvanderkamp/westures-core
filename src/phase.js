/**
 * @file phase.js
 */

/**
 * Normalizes window events to be either of type start, move, or end.
 *
 * @param {String} type - The event type emitted by the browser
 *
 * @return {null|String} - The normalized event, or null if it is an event not
 *    predetermined.
 */
const phase = Object.freeze({
  mousedown:   'start',
  touchstart:  'start',
  pointerdown: 'start',

  mousemove:   'move',
  touchmove:   'move',
  pointermove: 'move',

  mouseup:   'end',
  touchend:  'end',
  pointerup: 'end',
});
/* phase*/

module.exports = phase;

