/*
 * Contains the PHASE object, which translates event names to phases
 * (a.k.a. hooks).
 */

'use strict';

const CANCEL = 'cancel';
const END    = 'end';
const MOVE   = 'move';
const START  = 'start';

/**
 * Normalizes window events to be either of type start, move, end, or cancel.
 *
 * @private
 * @enum {string}
 */
const PHASE = Object.freeze({
  pointercancel: CANCEL,
  touchcancel:   CANCEL,

  mouseup:       END,
  pointerup:     END,
  touchend:      END,

  mousemove:   MOVE,
  pointermove: MOVE,
  touchmove:   MOVE,

  mousedown:   START,
  pointerdown: START,
  touchstart:  START,

  CANCEL,
  END,
  MOVE,
  START,
});

module.exports = PHASE;

