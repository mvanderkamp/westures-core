/*
 * Test suite for the utils module.
 */

/* global expect, describe, jest, test, beforeAll */

'use strict';

const {
  angularDifference,
  getPropagationPath,
  setDifference,
  setFilter,
} = require('../src/utils.js');

describe('angularDifference(a, b)', () => {
  test('Performs basic subtraction', () => {
    expect(angularDifference(2, 1)).toBe(1);
  });

  test('Wraps values > |pi|', () => {
    const HALF_PI = 1 / 2 * Math.PI;
    const PI_AND_HALF = 3 * HALF_PI;
    expect(angularDifference(0, PI_AND_HALF)).toBeCloseTo(HALF_PI);
    expect(angularDifference(0, -PI_AND_HALF)).toBeCloseTo(-HALF_PI);
  });
});

describe('getPropagationPath(event)', () => {
  let event = null;

  test('Calls event.composedPath() if available', () => {
    event = { composedPath: jest.fn() };
    expect(() => getPropagationPath(event)).not.toThrow();
    expect(event.composedPath).toHaveBeenCalledTimes(1);
  });

  test('Manually walks up to the window otherwise', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    event = { target: div };
    expect(getPropagationPath(event)).toEqual([
      div,
      document.body,
      document.body.parentNode,
      document,
      window,
    ]);
  });
});

describe('setFilter(set, predicate)', () => {
  let set = null;

  beforeAll(() => {
    set = new Set([1, 2, 3, 42, 'blah', 1]);
  });

  test('Throws TypeError if no set provided', () => {
    expect(() => setFilter()).toThrow(TypeError);
  });

  test('Throws TypeError if no predicate provided', () => {
    expect(() => setFilter(set)).toThrow(TypeError);
  });

  test('Returns a filtered set of elements matching the predicate', () => {
    const match = new Set([2, 42]);
    const predicate = e => e % 2 == 0;
    expect(setFilter(set, predicate)).toMatchObject(match);
  });
});

describe('setDifference(left, right)', () => {
  let left = null;
  let match = null;
  let right = null;

  beforeAll(() => {
    left = new Set([1, 2, 3, 42, 'blah', 1]);
    right = new Set([1, 2, 42]);
    match = new Set([3, 'blah']);
  });

  test('Throws TypeError if left not provided', () => {
    expect(() => setDifference()).toThrow(TypeError);
    expect(() => setDifference(null, right)).toThrow(TypeError);
  });

  test('Throws TypeError if right not provided', () => {
    expect(() => setDifference(left)).toThrow(TypeError);
  });

  test('Returns a set consisting of (left - right)', () => {
    expect(setDifference(left, right)).toMatchObject(match);
    expect(setDifference(right, left)).toMatchObject(new Set());
  });
});

