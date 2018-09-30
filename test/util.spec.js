'use strict';

/**
 * @file util.js
 * Tests the user-facing API, ensuring the object functions while not exposing
 * private members.
 */

const util = require('../src/util.js');

/** @test {util} */
describe('module', function() {
  test('exists', function() {
    expect(util).toBeDefined();
  });
});

/** @test {util.normalizeEvent} */
describe('normalizeEvent', function() {
  test('normalizes appropriate events to start', function() {
    expect(util.normalizeEvent[ 'mousedown' ]).toEqual('start');
    expect(util.normalizeEvent[ 'touchstart' ]).toEqual('start');
    expect(util.normalizeEvent[ 'pointerdown' ]).toEqual('start');
  });

  test('normalizes appropriate events to move', function() {
    expect(util.normalizeEvent[ 'mousemove' ]).toEqual('move');
    expect(util.normalizeEvent[ 'touchmove' ]).toEqual('move');
    expect(util.normalizeEvent[ 'pointermove' ]).toEqual('move');
  });

  test('normalizes appropriate events to end', function() {
    expect(util.normalizeEvent[ 'mouseup' ]).toEqual('end');
    expect(util.normalizeEvent[ 'touchend' ]).toEqual('end');
    expect(util.normalizeEvent[ 'pointerup' ]).toEqual('end');
  });

  test('normalizes to undefined for unknown events', function() {
    expect(util.normalizeEvent[ 'foobar' ]).toBeUndefined();
  });
});

describe('getMouseButtons', () => {
  test('Produces a list of identified buttons', () => {
    expect(util.getMouseButtons({ buttons: 3 })).toMatchObject([1,2]);
    expect(util.getMouseButtons({ buttons: 5 })).toMatchObject([1,4]);
    expect(util.getMouseButtons({ buttons: 7 })).toMatchObject([1,2,4]);
  });
});

describe('getPropagationPath', () => {
  const with_comp = {
    composedPath: jest.fn()
  };
  const no_comp = {
    target: {
      parentNode: {
        parentNode: {
          parentNode: document
        }
      }
    }
  }

  test('Uses composedPath(), if available', () => {
    expect(() => util.getPropagationPath(with_comp)).not.toThrow();
    expect(with_comp.composedPath).toHaveBeenCalled();
  });

  test('Walks up the DOM tree if composedPath not available', () => {
    let path = null;
    expect(() => path = util.getPropagationPath(no_comp)).not.toThrow();
    expect(path).toBeDefined();
    expect(path).toHaveLength(5);
    expect(path[3]).toBe(document);
    expect(path[4]).toBe(window);
  });
});

