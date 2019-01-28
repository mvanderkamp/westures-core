/**
 * @file Binding.js
 * Tests Binding class
 */

'use strict';

const Binding = require('../src/Binding.js');
const Gesture = require('../src/Gesture.js');

describe('Binding', () => {
  let gesture, element, handler;
  let binding;

  beforeEach(() => {
    gesture = {
      start: jest.fn(),
      move: jest.fn(),
      end: jest.fn(),
      cancel: jest.fn(),
    };
    element = document.createElement('div');
    handler = jest.fn();
  });

  describe('constructor', function() {
    test('Can be instantiated', () => {
      expect(() => {
        binding = new Binding(element, gesture, handler);
      }).not.toThrow();
    });
    
    test('Returns the correct class', () => {
      expect(new Binding(element, gesture, handler)).toBeInstanceOf(Binding);
    });

  });

  describe('evaluateHook(hook, state, events)', () => {
    let events, state;

    beforeEach(() => {
      events = ['hello', 'world'];
      state = 42;
      binding = new Binding(element, gesture, handler);
    });

    describe.each([['start'], ['move'], ['end']])('%s', (hook) => {
      test('Calls the appropriate hook', () => {
        binding.evaluateHook(hook, state, events); 
        expect(binding.gesture[hook]).toHaveBeenCalledTimes(1);
      });

      test('Passes the state as an argument to the hook', () => {
        binding.evaluateHook(hook, state, events); 
        expect(binding.gesture[hook]).toHaveBeenCalledWith(state);
      });

      test('Does not call the handler if null returned by hook', () => {
        binding.evaluateHook(hook, state, events); 
        expect(handler).toHaveBeenCalledTimes(0);
      });

      test('Calls the handler if non-null value returned by hook', () => {
        binding.gesture[hook].mockReturnValue({ x: 91 });
        binding.evaluateHook(hook, state, events); 
        expect(handler).toHaveBeenCalledTimes(1);
      });

      test('Handler is called with data returned by hook, plus events', () => {
        binding.gesture[hook].mockReturnValue({ x: 91 });
        binding.evaluateHook(hook, state, events); 
        expect(handler.mock.calls[0][0]).toMatchObject({
          x: 91,
          events
        });
      });
    });
  });
});


/** @test {Binding} */

