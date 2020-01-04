/**
 * Custom PointerEvent
 */

'use strict';

class PointerEvent {
  constructor(id, target, type, x, y) {
    this.id = id;
    this.pointerId = id;
    this.target = target;
    this.type = type;
    this.clientX = x;
    this.clientY = y;
  }
}

PointerEvent.start = 'pointerdown';
PointerEvent.move  = 'pointermove';
PointerEvent.end   = 'pointerup';

module.exports = PointerEvent;
