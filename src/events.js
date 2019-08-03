/*
 * Contains event list definitions.
 */

'use strict';

const CANCEL_EVENTS = [
  'blur',
  'pointercancel',
  'touchcancel',
];

const KEY_EVENTS = [
  'keydown',
  'keyup',
];

const MOUSE_EVENTS = [
  'mousedown',
  'mousemove',
  'mouseup',
];

const POINTER_EVENTS = [
  'pointerdown',
  'pointermove',
  'pointerup',
];

const TOUCH_EVENTS = [
  'touchend',
  'touchmove',
  'touchstart',
];

module.exports = {
  CANCEL_EVENTS,
  KEY_EVENTS,
  MOUSE_EVENTS,
  POINTER_EVENTS,
  TOUCH_EVENTS,
};

