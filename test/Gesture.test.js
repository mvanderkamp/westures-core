/* global expect, describe, test, jest, beforeEach */

'use strict';

const Gesture = require('../src/Gesture.js');
const {
  PHASES,
  STATE_KEYS,
} = require('../src/constants.js');

describe('Gesture', () => {
  describe('constructor', () => {
    test('Returns a new gesture of the given type', () => {
      let gesture = null;
      expect(() => {
        gesture = new Gesture('dummy');
      }).not.toThrow();
      expect(gesture.type).toBe('dummy');
    });

    test('Throws an exception if no type provided to constructor', () => {
      expect(() => new Gesture()).toThrow();
    });
  });

  describe('prototype methods', () => {
    describe.each(PHASES)('%s', (s) => {
      test('Returns null', () => {
        const gesture = new Gesture('dummy');
        expect(gesture[s]()).toBeNull();
      });
    });

    describe('evaluatePhase(hook, state)', () => {
      let element = null;
      let gesture = null;
      let handler = null;
      let state = null;

      beforeEach(() => {
        element = document.createElement('div');
        handler = jest.fn();
        state = 42;

        gesture = new Gesture('dummy', element, handler);
        Object.assign(gesture, {
          start:  jest.fn(),
          move:   jest.fn(),
          end:    jest.fn(),
          cancel: jest.fn(),
        });
      });

      describe.each(PHASES)('%s', (hook) => {
        test('Calls the appropriate hook', () => {
          gesture.evaluatePhase(hook, state);
          expect(gesture[hook]).toHaveBeenCalledTimes(1);
        });

        test('Passes the state as an argument to the hook', () => {
          gesture.evaluatePhase(hook, state);
          expect(gesture[hook]).toHaveBeenCalledWith(state);
        });

        test('Does not call the handler if null returned by hook', () => {
          gesture.evaluatePhase(hook, state);
          expect(handler).toHaveBeenCalledTimes(0);
        });

        test('Calls the handler if non-null value returned by hook', () => {
          gesture[hook].mockReturnValue({ x: 91 });
          gesture.evaluatePhase(hook, state);
          expect(handler).toHaveBeenCalledTimes(1);
        });

        test('Handler is called with data returned by hook', () => {
          gesture[hook].mockReturnValue({ x: 91 });
          gesture.evaluatePhase(hook, state);
          expect(handler.mock.calls[0][0]).toMatchObject({ x: 91 });
        });
      });
    });

    describe('recognize(hook, state, data)', () => {
      let element = null;
      let gesture = null;
      let handler = null;
      let state = null;

      beforeEach(() => {
        element = document.createElement('div');
        handler = jest.fn();
        state = 42;
        gesture = new Gesture('dummy', element, handler);
      });

      describe.each(PHASES)('%s', (hook) => {
        test('Calls the handler with an appropiate object', () => {
          const data = { answer: 42 };
          gesture.recognize(hook, state, data);
          expect(gesture.handler).toHaveBeenCalledTimes(1);

          const received = gesture.handler.mock.calls[0][0];
          expect(received.centroid).toBe(state.centroid);
          expect(received.event).toBe(state.event);
          expect(received.phase).toBe(hook);
          expect(received.type).toBe(gesture.type);
          expect(received.target).toBe(gesture.element);
          expect(received.answer).toBe(data.answer);
        });
      });
    });

    describe('isEnabled(state)', () => {
      let element = null;
      let gesture = null;
      let handler = null;
      let state = null;

      beforeEach(() => {
        element = document.createElement('div');
        handler = jest.fn();
        state = {
          active: [],
          event:  {},
        };

        gesture = new Gesture('dummy', element, handler);
      });

      test('Returns true by default if >= 1 active input', () => {
        state.active.push(1);
        expect(gesture.isEnabled(state)).toBe(true);
        for (let i = 0; i < 100; i++) {
          state.active.push(i);
        }
        expect(gesture.isEnabled(state)).toBe(true);
      });

      test('Returns true if active inputs >= minInputs', () => {
        Object.assign(gesture.options, { minInputs: 2 });
        state.active = [1, 2];
        expect(gesture.isEnabled(state)).toBe(true);
        state.active.push(34);
        expect(gesture.isEnabled(state)).toBe(true);
      });

      test('Returns false if active inputs < minInputs', () => {
        Object.assign(gesture.options, { minInputs: 2 });
        state.active = [1];
        expect(gesture.isEnabled(state)).toBe(false);
      });

      test('Returns true if active inputs <= maxInputs', () => {
        Object.assign(gesture.options, { maxInputs: 2 });
        state.active = [1];
        expect(gesture.isEnabled(state)).toBe(true);
        state.active.push(34);
        expect(gesture.isEnabled(state)).toBe(true);
      });

      test('Returns false if active inputs > minInputs', () => {
        Object.assign(gesture.options, { maxInputs: 2 });
        state.active = [1, 2, 3];
        expect(gesture.isEnabled(state)).toBe(false);
      });

      describe('enableKeys', () => {
        describe.each(STATE_KEYS)('%s', (key) => {
          beforeEach(() => {
            Object.assign(gesture.options, { enableKeys: [key] });
            state.active = [1];
          });

          test('Returns true if pressed', () => {
            state.event[key] = true;
            expect(gesture.isEnabled(state)).toBe(true);
          });

          test('Returns false if not pressed', () => {
            state.event[key] = false;
            expect(gesture.isEnabled(state)).toBe(false);
          });
        });
      });

      describe('disableKeys', () => {
        describe.each(STATE_KEYS)('%s', (key) => {
          beforeEach(() => {
            Object.assign(gesture.options, { disableKeys: [key] });
            state.active = [1];
          });

          test('Returns false if pressed', () => {
            state.event[key] = true;
            expect(gesture.isEnabled(state)).toBe(false);
          });

          test('Returns true if not pressed', () => {
            state.event[key] = false;
            expect(gesture.isEnabled(state)).toBe(true);
          });
        });

        test('disableKeys overrides enableKeys', () => {
          Object.assign(gesture.options, {
            disableKeys: [STATE_KEYS[0]],
            enableKeys:  [STATE_KEYS[1]],
          });
          state.active = [1];
          state.event[STATE_KEYS[0]] = true;
          state.event[STATE_KEYS[1]] = true;
          expect(gesture.isEnabled(state)).toBe(false);
        });
      });
    });
  });
});

