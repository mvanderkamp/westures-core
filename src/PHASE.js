/*
 * Contains the PHASE object, which translates event names to phases
 * (a.k.a. hooks).
 */

'use strict';

/**
 * Normalizes window events to be either of type start, move, or end.
 *
 * @private
 * @enum {string}
 */
const PHASE = Object.freeze({
  mousedown:   'start',
  touchstart:  'start',
  pointerdown: 'start',

  mousemove:   'move',
  touchmove:   'move',
  pointermove: 'move',

  mouseup:       'end',
  touchend:      'end',
  pointerup:     'end',

  touchcancel:   'cancel',
  pointercancel: 'cancel',
});

module.exports = PHASE;

