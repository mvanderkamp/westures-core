/*
 * Test suite for the Gesture class.
 */

'use strict';

const Gesture = require('../src/Gesture.js');

const HOOKS = ['start', 'move', 'end', 'cancel'];

describe('Gesture', () => {
  describe('constructor', () => {
    test('Returns a new gesture of the given type', () => {
      let gesture = null;
      expect(() => gesture = new Gesture('dummy')).not.toThrow();
      expect(gesture.type).toBe('dummy');
    });

    test('Throws an exception if no type provided to constructor', () => {
      expect(() => new Gesture()).toThrow();
    });
  });

  describe('methods', () => {
    describe('hooks', () => {
      describe.each(HOOKS)('%s', (s) => {
        test('Returns default: null', () => {
          const gesture = new Gesture('dummy');
          expect(gesture[s]()).toBeNull();
        });
      });
    });

    describe('evaluateHook', () => {
      const state = 42;
      const handler = jest.fn();
      const gesture = new Gesture('dummy', null, handler);

      HOOKS.forEach(hook => {
        gesture[hook] = jest.fn();
      });

      beforeEach(() => {
        handler.mockReset();
        HOOKS.forEach(hook => {
          gesture[hook].mockReset();
        });
      });

      describe.each(HOOKS)('%s', (hook) => {
        test('Calls the appropriate hook', () => {
          gesture.evaluateHook(hook, state);
          expect(gesture[hook]).toHaveBeenCalledTimes(1);
        });

        test('Passes the state as an argument to the hook', () => {
          gesture.evaluateHook(hook, state);
          expect(gesture[hook]).toHaveBeenCalledWith(state);
        });

        test('Does not call the handler if null returned by hook', () => {
          gesture[hook].mockReturnValue(null);
          gesture.evaluateHook(hook, state);
          expect(handler).toHaveBeenCalledTimes(0);
        });

        test('Calls the handler if non-null value returned by hook', () => {
          gesture[hook].mockReturnValue({ x: 91 });
          gesture.evaluateHook(hook, state);
          expect(handler).toHaveBeenCalledTimes(1);
        });

        test('Handler is called with data returned by hook', () => {
          gesture[hook].mockReturnValue({ x: 91 });
          gesture.evaluateHook(hook, state);
          expect(handler.mock.calls[0][0]).toMatchObject({
            x: 91,
          });
        });
      });
    });


  });


});

