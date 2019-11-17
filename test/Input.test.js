/*
 * Test suite for the Input class.
 */

/* global expect, describe, test, beforeAll, beforeEach */

'use strict';

const Input     = require('../src/Input.js');
const PointerData = require('../src/PointerData.js');

describe('Input', () => {
  let activediv = null;
  let parentdiv = null;
  let outerdiv  = null;
  let mousedown = null;
  let mousemove = null;

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
    let input = null;
    test('Can be instantiated', () => {
      expect(() => {
        input = new Input(mousedown, 1234);
      }).not.toThrow();
    });

    test('stores initial pointer data', () => {
      expect(input.initial).toBeInstanceOf(PointerData);
    });

    test('copies initial data to current data', () => {
      expect(input.current).toBeInstanceOf(PointerData);
      expect(input.current).toEqual(input.current);
    });
  });

  describe('prototype methods', () => {
    describe('getters', () => {
      let input = null;
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

    describe('update', () => {
      let input = null;
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
      let input = null;
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
          clientX:  46,
          clientY:  40,
          target:  document,
        };
        input.update(mousenext);
        expect(input.totalDistance()).toBeCloseTo(Math.sqrt(25));
      });
    });
  });
});


