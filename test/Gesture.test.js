/*
 * Test suite for the Gesture class.
 */

'use strict';

const Gesture = require('../src/Gesture.js');

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

  describe.each(['start', 'move', 'end'])('%s', (s) => {
    test('Returns null', () => {
      const gesture = new Gesture('dummy');
      expect(gesture[s]()).toBeNull();
    });
  });
});

