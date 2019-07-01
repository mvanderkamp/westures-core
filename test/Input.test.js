/*
 * Test suite for the Input class.
 */

'use strict';

const Input     = require('../src/Input.js');
const PointerData = require('../src/PointerData.js');

describe('Input', () => {
  let activediv;
  let parentdiv;
  let outerdiv;
  let mousedown;
  let mousemove;

  beforeAll(() => {
    parentdiv = document.createElement('div');
    document.body.appendChild(parentdiv);

    activediv = document.createElement('div');
    parentdiv.appendChild(activediv);

    outerdiv = document.createElement('div');
    document.body.appendChild(outerdiv);

    mousedown = {
      type:    'mousedown',
      clientX: 42,
      clientY: 43,
      target:  activediv,
    };

    mousemove = {
      type:    'mousemove',
      clientX: 45,
      clientY: 41,
      target:  document,
    };
  });

  describe('constructor', () => {
    let input;
    test('Can be instantiated', () => {
      expect(() => input = new Input(mousedown, 1234)).not.toThrow();
    });

    test('stores initial pointer data', () => {
      expect(input.initial).toBeInstanceOf(PointerData);
    });

    test('copies initial data to current data', () => {
      expect(input.current).toBeInstanceOf(PointerData);
      expect(input.current).toEqual(input.current);
    });
  });

  describe('getters', () => {
    let input;
    beforeEach(() => {
      input = new Input(mousedown, 1234);
    });

    describe('phase', () => {
      test('Returns the current phase of the Input', () => {
        expect(input.phase).toBe('start');
      });
    });

    describe('startTime', () => {
      test('Returns the time of the initial event', () => {
        expect(input.startTime).toBe(input.initial.time);
      });
    });
  });

  describe('getProgressOfGesture', () => {
    let input;
    beforeEach(() => {
      input = new Input(mousedown, 1234);
    });

    test('initial call generates empty progress object', () => {
      expect(input.getProgressOfGesture('tap')).toEqual({});
    });

    test('persistent data can be stored in the progress object', () => {
      expect(input.getProgressOfGesture('tap')).toEqual({});
      input.getProgressOfGesture('tap').foo = 8;
      expect(input.getProgressOfGesture('tap').foo).toEqual(8);
    });

    test('can store progress objects for many gestures', () => {
      const nums = {
        tap:    42,
        pinch:  812,
        rotate: 9157,
      };
      const gestures = ['tap', 'pinch', 'rotate'];

      gestures.forEach(id => {
        expect(input.getProgressOfGesture(id)).toEqual({});
        input.getProgressOfGesture(id).num = nums[id];
        expect(input.getProgressOfGesture(id).num).toEqual(nums[id]);
      });

      gestures.forEach(id => {
        expect(input.getProgressOfGesture(id).num).toEqual(nums[id]);
      });
    });
  });

  describe('update', () => {
    let input;
    beforeEach(() => {
      input = new Input(mousedown, 1234);
    });

    test('updates the current event', () => {
      input.update(mousemove);
      expect(input.previous).not.toBe(input.current);
      expect(input.current).toBeInstanceOf(PointerData);
    });
  });

  describe('totalDistance', () => {
    let input;
    beforeEach(() => {
      input = new Input(mousedown, 1234);
    });

    test('Measures the point distance from initial to current', () => {
      input.update(mousemove);
      expect(input.totalDistance()).toBeCloseTo(Math.sqrt(13));
    });

    test('Continues measuring from initial after more updates', () => {
      const mousenext = {
        type:    'mousedown',
        clientX: 46,
        clientY: 40,
        target:  document,
      };
      input.update(mousenext);
      expect(input.totalDistance()).toBeCloseTo(Math.sqrt(25));
    });
  });

  describe('wasInitiallyInside', () => {
    let input;
    beforeEach(() => {
      input = new Input(mousedown, 1234);
    });

    test('Returns true for initial target', () => {
      expect(input.wasInitiallyInside(activediv)).toBe(true);
    });

    test('Returns true for elements in the initial path', () => {
      expect(input.wasInitiallyInside(parentdiv)).toBe(true);
    });

    test('Returns true for document and window', () => {
      expect(input.wasInitiallyInside(document)).toBe(true);
      expect(input.wasInitiallyInside(window)).toBe(true);
    });

    test('Returns false for elements outside the initial path', () => {
      expect(input.wasInitiallyInside(outerdiv)).toBe(false);
    });
  });
});


