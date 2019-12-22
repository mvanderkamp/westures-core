/*
 * Test suite for the Region class.
 */

/* global expect, describe, test, jest, beforeAll, beforeEach */

'use strict';

const _ = require('lodash');
const Gesture = require('../src/Gesture.js');
const Region = require('../src/Region.js');
const {
  CANCEL,
  END,
  MOVE,
  START,

  STATE_KEYS,
  STATE_KEY_STRINGS,

  MOUSE_EVENTS,
  TOUCH_EVENTS,
  POINTER_EVENTS,
  CANCEL_EVENTS,
  KEYBOARD_EVENTS,
} = require('../src/constants.js');

let emptySet = null;
let element = null;
let options = null;
let region = null;
let gesture = null;
let gesture_element = null;
let handler = null;
let gesture2 = null;
let gesture_element2 = null;
let handler2 = null;
let touchend = null;
let touchmove = null;
let touchstart = null;
let touchend2 = null;
let touchmove2 = null;
let touchstart2 = null;

function addGestures() {
  region.addGesture(gesture);
  region.addGesture(gesture2);
}

function buildExpectPhaseForStateInputs(phase) {
  return function expectPhaseForStateInputs(state) {
    state.inputs.forEach(input => {
      expect(input.phase).toBe(phase);
    });
  };
}

class TouchEvent {
  constructor(type, x, y, target, identifier) {
    this.type = type;
    this.target = target;
    this.changedTouches = [{
      clientX:      x,
      clientY:      y,
      identifier: identifier,
    }];
    this.preventDefault = jest.fn();
  }
}

beforeAll(() => {
  emptySet = new Set();

  element = document.createElement('div');
  gesture_element = document.createElement('div');
  gesture_element2 = document.createElement('div');

  gesture_element.appendChild(gesture_element2);
  element.appendChild(gesture_element);
  document.body.appendChild(element);

  touchstart = new TouchEvent('touchstart', 42, 43, gesture_element, 0);
  touchmove = new TouchEvent('touchmove', 45, 41, gesture_element, 0);
  touchend = new TouchEvent('touchend', 45, 41, gesture_element, 0);
  touchstart2 = new TouchEvent('touchstart', 42, 43, gesture_element2, 1);
  touchmove2 = new TouchEvent('touchmove', 45, 41, gesture_element2, 1);
  touchend2 = new TouchEvent('touchend', 45, 41, gesture_element2, 1);
});

beforeEach(() => {
  element.addEventListener = jest.fn();
  window.addEventListener = jest.fn();
});

describe('Region', () => {
  describe('constructor(element, options = {})', () => {
    test('Throws TypeError if no element provided', () => {
      expect(() => new Region()).toThrow(TypeError);
    });

    test('Instantiates a Region if an element is provided', () => {
      expect(() => {
        region = new Region(element);
      }).not.toThrow();
      expect(region).toBeInstanceOf(Region);
    });

    test('Attaches mouse and touch event listeners to the element', () => {
      new Region(element);

      MOUSE_EVENTS.concat(TOUCH_EVENTS).forEach(event => {
        expect(element.addEventListener)
          .toHaveBeenCalledWith(event, expect.anything(), {
            'capture': false,
            'once':    false,
            'passive': false,
          });
      });
    });

    test('Attaches pointer event listeners instead if required', () => {
      const oldMouseEvent = window.MouseEvent;
      const oldTouchEevent = window.TouchEvent;
      window.MouseEvent = null;
      window.TouchEvent = null;

      new Region(element);
      POINTER_EVENTS.forEach(event => {
        expect(element.addEventListener)
          .toHaveBeenCalledWith(event, expect.anything(), {
            'capture': false,
            'once':    false,
            'passive': false,
          });
      });

      window.MouseEvent = oldMouseEvent;
      window.TouchEvent = oldTouchEevent;
    });

    test('Attaches "cancel" and keyboard event listeners to the window', () => {
      new Region(element);
      CANCEL_EVENTS.concat(KEYBOARD_EVENTS).forEach(event => {
        expect(window.addEventListener)
          .toHaveBeenCalledWith(event, expect.anything());
      });
    });
  });

  describe('prototype methods', () => {
    let gesture2_set = null;
    let gesture_both_set = null;
    let gesture_set = null;

    beforeEach(() => {
      region = new Region(element);

      handler = jest.fn();
      gesture = new Gesture('one', gesture_element, handler);
      Object.assign(gesture, {
        start:  jest.fn(),
        move:   jest.fn(),
        end:    jest.fn(),
        cancel: jest.fn(),
      });

      handler2 = jest.fn();
      options = { minInputs: 2 };
      gesture2 = new Gesture('two', gesture_element2, handler2, options);
      Object.assign(gesture2, {
        start:  jest.fn(),
        move:   jest.fn(),
        end:    jest.fn(),
        cancel: jest.fn(),
      });

      gesture_set = new Set([gesture]);
      gesture2_set = new Set([gesture2]);
      gesture_both_set = new Set([gesture, gesture2]);
    });

    describe('addGesture(gesture)', () => {
      test('Adds the given gesture to the region', () => {
        expect(() => region.addGesture(gesture)).not.toThrow();
        expect(region.gestures.has(gesture)).toBe(true);
      });
    });

    describe('getGesturesByElement(element)', () => {
      test('Returns the set of gestures attached to the given element', () => {
        region.addGesture(gesture);
        region.addGesture(gesture2);
        expect(region.gestures.has(gesture)).toBe(true);
        expect(region.gestures.has(gesture2)).toBe(true);
        expect(region.getGesturesByElement()).toMatchObject(emptySet);
        expect(region.getGesturesByElement(gesture_element))
          .toMatchObject(gesture_set);
        expect(region.getGesturesByElement(gesture_element2))
          .toMatchObject(gesture2_set);
      });
    });

    describe('cancel(event)', () => {
      beforeEach(addGestures);

      test('Resets the state', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.state.inputs.length).toBe(2);

        expect(() => region.cancel(new MouseEvent('down'))).not.toThrow();
        expect(region.state.inputs.length).toBe(0);
      });

      test('Resets the active and potential gesture sets', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.gestures).toMatchObject(gesture_both_set);
        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);

        expect(() => region.cancel(new MouseEvent('down'))).not.toThrow();

        expect(region.potentialGestures).toMatchObject(emptySet);
        expect(region.activeGestures).toMatchObject(emptySet);
      });

      test('Calls the "cancel" hook for active gestures', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(gesture.cancel).not.toHaveBeenCalled();
        expect(() => region.cancel(new CustomEvent('blur'))).not.toThrow();
        expect(gesture.cancel).toHaveBeenCalledTimes(1);
      });

      test('Called hooks receive inputs whose phase is "cancel"', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        gesture.cancel = buildExpectPhaseForStateInputs(CANCEL);
        region.cancel(new CustomEvent('blur'));
      });
    });

    describe('setPotentialGestures()', () => {
      beforeEach(addGestures);

      test('Sets the potential gestures to those containing input 0', () => {
        region.state.updateAllInputs(touchstart);
        expect(() => region.setPotentialGestures()).not.toThrow();
        expect(region.potentialGestures).toMatchObject(gesture_set);

        region.cancel(touchstart);
        region.state.updateAllInputs(touchstart2);
        expect(() => region.setPotentialGestures()).not.toThrow();
        expect(region.potentialGestures)
          .toMatchObject(gesture_both_set);
      });
    });

    describe('setActiveGestures()', () => {
      beforeEach(addGestures);

      test('Sets the active gestures to those that are enabled', () => {
        region.state.updateAllInputs(touchstart2);
        region.setPotentialGestures();
        expect(region.potentialGestures).toMatchObject(gesture_both_set);

        expect(() => region.setActiveGestures()).not.toThrow();
        expect(region.activeGestures).toMatchObject(gesture_set);
      });
    });

    describe('resetActiveGestures()', () => {
      beforeEach(addGestures);

      test('Sets the active and potential gestures to empty sets', () => {
        region.state.updateAllInputs(touchstart2);
        region.setPotentialGestures();
        region.setActiveGestures();
        expect(() => region.resetActiveGestures()).not.toThrow();
        expect(region.potentialGestures).toMatchObject(emptySet);
        expect(region.activeGestures).toMatchObject(emptySet);
      });
    });

    describe('updateActiveGestures(event, isInitial)', () => {
      beforeEach(addGestures);

      test('Sets the potential and active gestures on initial contact', () => {
        region.state.updateAllInputs(touchstart2);
        expect(() => region.updateActiveGestures(touchstart2, true))
          .not.toThrow();

        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_set);
      });

      test('Sets the active gestures on non-initial contact', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);

        region.state.updateAllInputs(touchend2);

        // State isn't updated, so can pretend it doesn't enable gesture2.
        region.updateActiveGestures(touchstart2, false);

        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_set);
      });

      test('Is a no-op if event phase is not "start"', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, true);
        region.state.updateAllInputs(touchend2);

        expect(() => region.updateActiveGestures(touchend2, false))
          .not.toThrow();
        expect(region.potentialGestures).toMatchObject(gesture_both_set);

        // Active gestures not changed, so both are still in the set.
        // Otherwise gestures would never receive their 'end' phase.
        expect(region.activeGestures).toMatchObject(gesture_both_set);
      });
    });

    describe('pruneActiveGestures(event)', () => {
      beforeEach(addGestures);

      test('Is a no-op if event phase is not "end"', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);

        region.state.updateAllInputs(touchmove);
        region.state.clearEndedInputs();
        expect(region.state.hasNoInputs()).toBe(false);
        expect(() => region.pruneActiveGestures(touchend)).not.toThrow();

        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);
      });

      test('Updates the active gestures if active inputs remain', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);

        region.state.updateAllInputs(touchend);
        region.state.clearEndedInputs();
        expect(region.state.hasNoInputs()).toBe(false);
        expect(() => region.pruneActiveGestures(touchend)).not.toThrow();

        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_set);
      });

      test(
        'Resets active and potential lists if there are no active inputs',
        () => {
          region.state.updateAllInputs(touchstart2);
          region.updateActiveGestures(touchstart2, true);
          region.state.updateAllInputs(touchstart);
          region.updateActiveGestures(touchstart, false);

          expect(region.potentialGestures).toMatchObject(gesture_both_set);
          expect(region.activeGestures).toMatchObject(gesture_both_set);

          region.state.updateAllInputs(touchend2);
          region.state.updateAllInputs(touchend);
          region.state.clearEndedInputs();
          expect(region.state.hasNoInputs()).toBe(true);
          expect(() => region.pruneActiveGestures(touchend)).not.toThrow();

          expect(region.potentialGestures).toMatchObject(emptySet);
          expect(region.activeGestures).toMatchObject(emptySet);
        },
      );
    });

    describe('removeGesture(gesture)', () => {
      beforeEach(addGestures);

      test('Is a no-op if gesture does not belong to the region', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.gestures).toMatchObject(gesture_both_set);
        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);

        expect(() => {
          region.removeGesture(new Gesture('dummy', element, jest.fn()));
        }).not.toThrow();

        expect(region.gestures).toMatchObject(gesture_both_set);
        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);
      });

      test('Removes the gesture completely from the region', () => {
        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.gestures).toMatchObject(gesture_both_set);
        expect(region.potentialGestures).toMatchObject(gesture_both_set);
        expect(region.activeGestures).toMatchObject(gesture_both_set);

        expect(() => region.removeGesture(gesture)).not.toThrow();

        expect(region.gestures).toMatchObject(gesture2_set);
        expect(region.potentialGestures).toMatchObject(gesture2_set);
        expect(region.activeGestures).toMatchObject(gesture2_set);
      });
    });

    describe('removeGesturesByElement(element, gesture)', () => {
      beforeEach(addGestures);

      test('Removes all gestures bound to the given element', () => {
        const gesture3 = new Gesture('dummy', gesture_element, jest.fn());
        const gesture_all_set = new Set([gesture, gesture2, gesture3]);
        region.addGesture(gesture3);

        region.state.updateAllInputs(touchstart2);
        region.updateActiveGestures(touchstart2, true);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, false);

        expect(region.gestures).toMatchObject(gesture_all_set);
        expect(region.potentialGestures).toMatchObject(gesture_all_set);
        expect(region.activeGestures).toMatchObject(gesture_all_set);

        expect(() => region.removeGesturesByElement(gesture_element))
          .not.toThrow();

        expect(region.gestures).toMatchObject(gesture2_set);
        expect(region.potentialGestures).toMatchObject(gesture2_set);
        expect(region.activeGestures).toMatchObject(gesture2_set);
      });
    });

    describe('handleKeyboardEvent(event)', () => {
      const zippedKeys = _.zip(STATE_KEY_STRINGS, STATE_KEYS);
      describe.each(zippedKeys)('%s', (key, keyCheck) => {
        describe('keydown', () => {
          let event = null;

          beforeEach(() => {
            event = new KeyboardEvent('keydown', {
              key,
              [keyCheck]: true,
            });

            Object.assign(gesture.options, {
              enableKeys: [keyCheck],
            });

            Object.assign(gesture2.options, {
              minInputs:   1,
              disableKeys: [keyCheck],
            });
          });

          test(`If ${keyCheck} is in enableKeys, activates the gesture`, () => {
            region.addGesture(gesture);
            region.state.updateAllInputs(touchstart);
            region.updateActiveGestures(touchstart, true);

            expect(region.gestures).toMatchObject(gesture_set);
            expect(region.potentialGestures).toMatchObject(gesture_set);
            expect(region.activeGestures).toMatchObject(emptySet);

            expect(() => region.handleKeyboardEvent(event)).not.toThrow();

            expect(region.gestures).toMatchObject(gesture_set);
            expect(region.potentialGestures).toMatchObject(gesture_set);
            expect(region.activeGestures).toMatchObject(gesture_set);
          });

          test(
            `If ${keyCheck} is in disableKeys, deactivates the gesture`,
            () => {
              region.addGesture(gesture2);
              region.state.updateAllInputs(touchstart2);
              region.updateActiveGestures(touchstart2, true);

              expect(region.gestures).toMatchObject(gesture2_set);
              expect(region.potentialGestures).toMatchObject(gesture2_set);
              expect(region.activeGestures).toMatchObject(gesture2_set);

              expect(() => region.handleKeyboardEvent(event)).not.toThrow();

              expect(region.gestures).toMatchObject(gesture2_set);
              expect(region.potentialGestures).toMatchObject(gesture2_set);
              expect(region.activeGestures).toMatchObject(emptySet);
            },
          );

          test('Calls "start" hook of activated gestures', () => {
            region.addGesture(gesture);
            region.state.updateAllInputs(touchstart);
            region.updateActiveGestures(touchstart, true);

            expect(gesture.start).not.toHaveBeenCalled();
            expect(() => region.handleKeyboardEvent(event)).not.toThrow();
            expect(gesture.start).toHaveBeenCalled();
          });

          test('Calls "end" hook of deactivated gestures', () => {
            region.addGesture(gesture2);
            region.state.updateAllInputs(touchstart2);
            region.updateActiveGestures(touchstart2, true);

            expect(gesture2.end).not.toHaveBeenCalled();
            expect(() => region.handleKeyboardEvent(event)).not.toThrow();
            expect(gesture2.end).toHaveBeenCalled();
          });
        });

        describe('keyup', () => {
          let event = null;
          let keydown = null;

          beforeEach(() => {
            keydown = new KeyboardEvent('keydown', {
              key,
              [keyCheck]: true,
            });

            event = new KeyboardEvent('keyup', {
              key,
              [keyCheck]: false,
            });

            Object.assign(gesture.options, {
              enableKeys: [keyCheck],
            });

            Object.assign(gesture2.options, {
              minInputs:   1,
              disableKeys: [keyCheck],
            });
          });

          test(
            `If ${keyCheck} is in enableKeys, deactivates the gesture`,
            () => {
              region.addGesture(gesture);
              region.state.updateAllInputs(touchstart);
              region.updateActiveGestures(touchstart, true);

              expect(() => region.handleKeyboardEvent(keydown)).not.toThrow();

              expect(region.gestures).toMatchObject(gesture_set);
              expect(region.potentialGestures).toMatchObject(gesture_set);
              expect(region.activeGestures).toMatchObject(gesture_set);

              expect(() => region.handleKeyboardEvent(event)).not.toThrow();

              expect(region.gestures).toMatchObject(gesture_set);
              expect(region.potentialGestures).toMatchObject(gesture_set);
              expect(region.activeGestures).toMatchObject(emptySet);
            },
          );

          test(
            `If ${keyCheck} is in disableKeys, activates the gesture`,
            () => {
              region.addGesture(gesture2);
              region.state.updateAllInputs(touchstart2);
              region.updateActiveGestures(touchstart2, true);

              expect(() => region.handleKeyboardEvent(keydown)).not.toThrow();

              expect(region.gestures).toMatchObject(gesture2_set);
              expect(region.potentialGestures).toMatchObject(gesture2_set);
              expect(region.activeGestures).toMatchObject(emptySet);

              expect(() => region.handleKeyboardEvent(event)).not.toThrow();

              expect(region.gestures).toMatchObject(gesture2_set);
              expect(region.potentialGestures).toMatchObject(gesture2_set);
              expect(region.activeGestures).toMatchObject(gesture2_set);
            },
          );

          test('Calls "start" hook of activated gestures', () => {
            region.addGesture(gesture2);
            region.state.updateAllInputs(touchstart2);
            region.updateActiveGestures(touchstart2, true);

            expect(() => region.handleKeyboardEvent(keydown)).not.toThrow();
            expect(gesture2.start).not.toHaveBeenCalled();
            expect(() => region.handleKeyboardEvent(event)).not.toThrow();
            expect(gesture2.start).toHaveBeenCalled();
          });

          test('Calls "end" hook of deactivated gestures', () => {
            region.addGesture(gesture);
            region.state.updateAllInputs(touchstart);
            region.updateActiveGestures(touchstart, true);

            expect(() => region.handleKeyboardEvent(keydown)).not.toThrow();
            expect(gesture.end).not.toHaveBeenCalled();
            expect(() => region.handleKeyboardEvent(event)).not.toThrow();
            expect(gesture.end).toHaveBeenCalled();
          });
        });
      });

      test('Is a no-op if "event.key" is not in STATE_KEY_STRINGS', () => {
        const event = new KeyboardEvent('keyup', {
          key:     'K',
          ctrlKey: true,
        });

        Object.assign(gesture.options, {
          disableKeys: ['ctrlKey'],
        });

        region.addGesture(gesture);
        region.state.updateAllInputs(touchstart);
        region.updateActiveGestures(touchstart, true);

        expect(region.gestures).toMatchObject(gesture_set);
        expect(region.potentialGestures).toMatchObject(gesture_set);
        expect(region.activeGestures).toMatchObject(gesture_set);

        expect(() => region.handleKeyboardEvent(event)).not.toThrow();

        expect(region.gestures).toMatchObject(gesture_set);
        expect(region.potentialGestures).toMatchObject(gesture_set);
        expect(region.activeGestures).toMatchObject(gesture_set);
      });
    });

    describe('arbitrate(event)', () => {
      beforeEach(addGestures);

      test('Sets up potential gestures on initial contact', () => {
        expect(() => region.arbitrate(touchstart)).not.toThrow();
        expect(region.potentialGestures).toMatchObject(gesture_set);
      });

      test('Calls the appropriate hook for active gestures', () => {
        expect(gesture.start).not.toHaveBeenCalled();
        region.arbitrate(touchstart);
        expect(gesture.start).toHaveBeenCalledTimes(1);

        expect(gesture.move).not.toHaveBeenCalled();
        region.arbitrate(touchmove);
        expect(gesture.move).toHaveBeenCalledTimes(1);

        region.arbitrate(touchstart2);
        expect(gesture.start).toHaveBeenCalledTimes(2);
        region.arbitrate(touchmove2);
        expect(gesture.move).toHaveBeenCalledTimes(2);

        expect(gesture.end).not.toHaveBeenCalled();
        region.arbitrate(touchend);
        expect(gesture.end).toHaveBeenCalledTimes(1);

        region.arbitrate(touchend2);
        expect(gesture.end).toHaveBeenCalledTimes(2);
      });

      test('Clears ended inputs after "end" hook and resets active set', () => {
        expect(region.state.hasNoInputs()).toBe(true);
        expect(region.activeGestures).toMatchObject(emptySet);
        region.arbitrate(touchstart);
        expect(region.state.hasNoInputs()).toBe(false);
        expect(region.activeGestures).toMatchObject(gesture_set);
        region.arbitrate(touchend);
        expect(region.state.hasNoInputs()).toBe(true);
        expect(region.activeGestures).toMatchObject(emptySet);
      });

      test('Does not call any hooks if no bound element targeted', () => {
        const event = new TouchEvent('touchstart', 42, 43, element, 0);

        expect(gesture.start).not.toHaveBeenCalled();
        expect(gesture2.start).not.toHaveBeenCalled();
        expect(region.state.hasNoInputs()).toBe(true);
        expect(region.activeGestures).toMatchObject(emptySet);

        expect(() => region.arbitrate(event)).not.toThrow();

        expect(gesture.start).not.toHaveBeenCalled();
        expect(gesture2.start).not.toHaveBeenCalled();
        expect(region.state.hasNoInputs()).toBe(false);
        expect(region.activeGestures).toMatchObject(emptySet);
      });

      test('Does not add active gesture if not initially targeted', () => {
        Object.assign(gesture2.options, { minInputs: 1 });

        expect(gesture2.start).not.toHaveBeenCalled();
        expect(gesture2.move).not.toHaveBeenCalled();
        expect(gesture2.end).not.toHaveBeenCalled();

        region.arbitrate(touchstart);
        region.arbitrate(touchmove);
        region.arbitrate(touchstart2);
        region.arbitrate(touchmove2);
        region.arbitrate(touchend);
        region.arbitrate(touchend2);

        expect(gesture2.start).not.toHaveBeenCalled();
        expect(gesture2.move).not.toHaveBeenCalled();
        expect(gesture2.end).not.toHaveBeenCalled();
      });

      test('Activates gesture, if not initially targeted, after reset', () => {
        Object.assign(gesture2.options, { minInputs: 1 });

        region.arbitrate(touchstart);
        region.arbitrate(touchmove);
        region.arbitrate(touchstart2);
        region.arbitrate(touchmove2);
        region.arbitrate(touchend);
        region.arbitrate(touchend2);

        expect(gesture2.start).not.toHaveBeenCalled();
        expect(gesture2.move).not.toHaveBeenCalled();
        expect(gesture2.end).not.toHaveBeenCalled();

        // Only now can the second gesture become active!
        region.arbitrate(touchstart2);
        region.arbitrate(touchmove2);
        region.arbitrate(touchend2);

        expect(gesture2.start).toHaveBeenCalledTimes(1);
        expect(gesture2.move).toHaveBeenCalledTimes(1);
        expect(gesture2.end).toHaveBeenCalledTimes(1);
      });

      test('Calls preventDefault, if requested', () => {
        touchstart.preventDefault = jest.fn();
        expect(touchstart.preventDefault).not.toHaveBeenCalled();
        region.arbitrate(touchstart);
        expect(touchstart.preventDefault).toHaveBeenCalledTimes(1);
      });

      test('Does not call preventDefault, if requested', () => {
        touchstart.preventDefault = jest.fn();
        region.preventDefault = false;
        expect(touchstart.preventDefault).not.toHaveBeenCalled();
        region.arbitrate(touchstart);
        expect(touchstart.preventDefault).not.toHaveBeenCalled();
      });

      test('Sets the correct phase on each input', () => {
        gesture.start = buildExpectPhaseForStateInputs(START);
        gesture.move = buildExpectPhaseForStateInputs(MOVE);
        gesture.end = buildExpectPhaseForStateInputs(END);

        region.arbitrate(touchstart);
        region.arbitrate(touchmove);
        region.arbitrate(touchend);
      });
    });
  });
});

