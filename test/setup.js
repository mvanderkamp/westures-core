/* global jest */
/* eslint-disable max-classes-per-file */

'use strict';

class InputEvent {
  constructor(type, target = window) {
    this.type = type;
    this.target = target;
    this.preventDefault = jest.fn();
  }
}
global.InputEvent = InputEvent;

class TouchEvent extends InputEvent {
  constructor(type, x = 0, y = 0, target = window, identifier = 0) {
    super(type, target);
    this.changedTouches = [{
      clientX:      x,
      clientY:      y,
      identifier: identifier,
    }];
  }
}
global.TouchEvent = TouchEvent;

class MouseEvent extends InputEvent {
  constructor(type, x = 0, y = 0, target = window, button = 0) {
    super(type, target);
    this.clientX = x;
    this.clientY = y;
    this.button = button;
  }
}
global.MouseEvent = MouseEvent;

class PointerEvent extends InputEvent {
  constructor(type, x = 0, y = 0, target = window, pointerId = 0) {
    super(type, target);
    this.clientX = x;
    this.clientY = y;
    this.pointerId = pointerId;
  }
}
global.PointerEvent = PointerEvent;
