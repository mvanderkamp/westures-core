/*
 * Contains event list definitions, PHASE mapping, and other constants.
 */

'use strict';

/**
 * List of events that trigger the cancel phase.
 *
 * @private
 * @memberof westures-core
 * @enum
 */
const CANCEL_EVENTS = Object.freeze([
  'blur',
  'pointercancel',
  'touchcancel',
]);

/**
 * List of keyboard events that trigger a restart.
 *
 * @private
 * @memberof westures-core
 * @enum
 */
const KEYBOARD_EVENTS = Object.freeze([
  'keydown',
  'keyup',
]);

/**
 * List of mouse events to listen to.
 *
 * @private
 * @memberof westures-core
 * @enum
 */
const MOUSE_EVENTS = Object.freeze([
  'mousedown',
  'mousemove',
  'mouseup',
]);

/**
 * List of pointer events to listen to.
 *
 * @private
 * @memberof westures-core
 * @enum
 */
const POINTER_EVENTS = Object.freeze([
  'pointerdown',
  'pointermove',
  'pointerup',
]);

/**
 * List of touch events to listen to.
 *
 * @private
 * @memberof westures-core
 * @enum
 */
const TOUCH_EVENTS = Object.freeze([
  'touchend',
  'touchmove',
  'touchstart',
]);

/**
 * List of potentially state-modifying keys.
 *
 * @private
 * @memberof westures-core
 * @enum
 */
const STATE_KEYS = Object.freeze([
  'altKey',
  'ctrlKey',
  'metaKey',
  'shiftKey',
]);

/**
 * The cancel phase.
 *
 * @private
 * @memberof westures-core
 * @type { string }
 */
const CANCEL = 'cancel';

/**
 * The end phase.
 *
 * @private
 * @memberof westures-core
 * @type { string }
 */
const END    = 'end';

/**
 * The move phase.
 *
 * @private
 * @memberof westures-core
 * @type { string }
 */
const MOVE   = 'move';

/**
 * The start phase.
 *
 * @private
 * @memberof westures-core
 * @type { string }
 */
const START  = 'start';

/**
 * Normalizes window events to be either of type start, move, end, or cancel.
 *
 * @private
 * @memberof westures-core
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
});

module.exports = {
  CANCEL_EVENTS,
  KEYBOARD_EVENTS,
  MOUSE_EVENTS,
  POINTER_EVENTS,
  TOUCH_EVENTS,

  STATE_KEYS,

  CANCEL,
  END,
  MOVE,
  START,

  PHASE,
};

