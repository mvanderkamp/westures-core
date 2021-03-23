'use strict';

/**
 * List of events that trigger the cancel phase.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const CANCEL_EVENTS = [
  'blur',
  'pointercancel',
  'touchcancel',
  'mouseleave',
];

/**
 * List of keyboard events that trigger a restart.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const KEYBOARD_EVENTS = [
  'keydown',
  'keyup',
];

/**
 * List of mouse events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const MOUSE_EVENTS = [
  'mousedown',
  'mousemove',
  'mouseup',
];

/**
 * List of pointer events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const POINTER_EVENTS = [
  'pointerdown',
  'pointermove',
  'pointerup',
];

/**
 * List of touch events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const TOUCH_EVENTS = [
  'touchend',
  'touchmove',
  'touchstart',
];

/**
 * List of potentially state-modifying keys.
 * Entries are: ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].
 *
 * @memberof westures-core
 * @type {string[]}
 */
const STATE_KEYS = [
  'altKey',
  'ctrlKey',
  'metaKey',
  'shiftKey',
];

/**
 * List of the 'key' values on KeyboardEvent objects of the potentially
 * state-modifying keys.
 *
 * @memberof westures-core
 * @type {string[]}
 */
const STATE_KEY_STRINGS = [
  'Alt',
  'Control',
  'Meta',
  'Shift',
];

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
 * The recognized phases.
 *
 * @memberof westures-core
 * @type {list.<string>}
 */
const PHASES = [START, MOVE, END, CANCEL];

/**
 * Object that normalizes the names of window events to be either of type start,
 * move, end, or cancel.
 *
 * @memberof westures-core
 * @type {object}
 */
const PHASE = {
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
};

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
  PHASES,
};

