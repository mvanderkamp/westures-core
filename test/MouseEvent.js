'use strict';

class MouseEvent {
  constructor(id, target, type, x, y) {
    this.id = id;
    this.button = id;
    this.target = target;
    this.type = type;
    this.clientX = x;
    this.clientY = y;
  }
}

MouseEvent.start = 'mousedown';
MouseEvent.move  = 'mousemove';
MouseEvent.end   = 'mouseup';

module.exports = MouseEvent;
