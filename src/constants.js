/*
 * Contains event list definitions, PHASE mapping, and other constants.
 */

'use strict';

/**
 * List of events that trigger the cancel phase.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const CANCEL_EVENTS = Object.freeze([
  'blur',
  'pointercancel',
  'touchcancel',
]);

/**
 * List of keyboard events that trigger a restart.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const KEYBOARD_EVENTS = Object.freeze([
  'keydown',
  'keyup',
]);

/**
 * List of mouse events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const MOUSE_EVENTS = Object.freeze([
  'mousedown',
  'mousemove',
  'mouseup',
]);

/**
 * List of pointer events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const POINTER_EVENTS = Object.freeze([
  'pointerdown',
  'pointermove',
  'pointerup',
]);

/**
 * List of touch events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const TOUCH_EVENTS = Object.freeze([
  'touchend',
  'touchmove',
  'touchstart',
]);

/**
 * List of potentially state-modifying keys.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const STATE_KEYS = Object.freeze([
  'altKey',
  'ctrlKey',
  'metaKey',
  'shiftKey',
]);

/**
 * List of the 'key' values on KeyboardEvent objects of the potentially
 * state-modifying keys.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const STATE_KEY_STRINGS = Object.freeze([
  'Alt',
  'Control',
  'Meta',
  'Shift',
]);

/**
 * The cancel phase.
 *
 * @memberof westures-core
 * @type {string}
 */
const CANCEL = 'cancel';

/**
 * The end phase.
 *
 * @memberof westures-core
 * @type {string}
 */
const END = 'end';

/**
 * The move phase.
 *
 * @memberof westures-core
 * @type {string}
 */
const MOVE = 'move';

/**
 * The start phase.
 *
 * @memberof westures-core
 * @type {string}
 */
const START = 'start';

/**
 * Object that normalizes the names of window events to be either of type start,
 * move, end, or cancel.
 *
 * @memberof westures-core
 * @type {object}
 */
const PHASE = Object.freeze({
  blur:           CANCEL,
  pointercancel:  CANCEL,
  touchcancel:    CANCEL,

  mouseup:       END,
  pointerup:     END,
  touchend:      END,

  mousemove:   MOVE,
  pointermove: MOVE,
  touchmove:   MOVE,

  mousedown:   START,
  pointerdown: START,
  touchstart:  START,
});

module.exports = {
  CANCEL_EVENTS,
  KEYBOARD_EVENTS,
  MOUSE_EVENTS,
  POINTER_EVENTS,
  TOUCH_EVENTS,

  STATE_KEYS,
  STATE_KEY_STRINGS,

  CANCEL,
  END,
  MOVE,
  START,

  PHASE,
};

