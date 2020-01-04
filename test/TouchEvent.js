/**
 * Custom TouchEvent
 */

'use strict';

class TouchEvent {
  constructor(id, target, type, x, y) {
    this.target = target;
    this.type = type;
    this.changedTouches = [{
      identifier: id,
      clientX:    x,
      clientY:    y,
    }];
  }
}

TouchEvent.start = 'touchstart';
TouchEvent.move  = 'touchmove';
TouchEvent.end   = 'touchend';

module.exports = TouchEvent;
