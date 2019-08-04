/*
 * Test suite for the Region class.
 */

'use strict';

const Gesture = require('../src/Gesture.js');
const Region = require('../src/Region.js');
const {
  KEYBOARD_EVENTS,
  STATE_KEYS,
  STATE_KEY_STRINGS,
} = require('../src/constants.js');

let emptySet;
let element, options, region;
let gesture, gesture_element, handler;
let gesture2, gesture_element2, handler2;
let touchend, touchmove, touchstart;
let touchend2, touchmove2, touchstart2;

function addGestures() {
  region.addGesture(gesture);
  region.addGesture(gesture2);
}

class TouchEvent {
  constructor(type, x, y, target, identifier) {
    this.type = type;
    this.target = target;
    this.changedTouches = [{
      pageX:      x,
      pageY:      y,
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

    test('Attaches input event listeners to the element', () => {
      region = new Region(element);
      expect(element.addEventListener).toHaveBeenCalled();
    });

    test('Attaches event listeners to the window', () => {
      region = new Region(element);
      expect(window.addEventListener).toHaveBeenCalled();
    });
  });

  describe('prototype methods', () => {
    let gesture2_set, gesture_both_set, gesture_set;

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
        }
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
    });

    describe('handleKeyboardEvent(event)', () => {
      // [0] is 'key' for event, [1] is for boolean property
      // TODO: Should this be changed to an object?
      const zippedKeys = STATE_KEY_STRINGS.map((e, i) => [e, STATE_KEYS[i]]);

      describe.each(zippedKeys)('%s', (key, keyCheck) => {
        describe('keydown', () => {
          let event;

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

          test(`If ${keyCheck} is in disableKeys, deactivates the gesture`,
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
            }
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
          let event, keydown;

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

          test(`If ${keyCheck} is in enableKeys, deactivates the gesture`,
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
            }
          );

          test(`If ${keyCheck} is in disableKeys, activates the gesture`,
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
            }
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
    });
  });
});

