/*
 * Test suite for the Smoothable class.
 */

'use strict';

const Smoothable = require('../src/Smoothable');
const Point2D = require('../src/Point2D');

describe('Smoothable', () => {
  describe('constructor(options)', () => {
    test('Instantiates the correct class', () => {
      expect(new Smoothable()).toBeInstanceOf(Smoothable);
    });

    test('Accepts an identity option', () => {
      const sdata = new Smoothable({ identity: 42 });
      expect(sdata.identity).toBe(42);
    });
  });

  describe('methods', () => {
    describe('next(data)', () => {
      test('Returns a smoothed value if applySmoothing option is on', () => {
        const sdata = new Smoothable();
        expect(sdata.next(2)).toBe(1);
      });

      test('Returns the supplied value if applySmoothing option is off', () => {
        const sdata = new Smoothable({ applySmoothing: false });
        expect(sdata.next(2)).toBe(2);
      });

      test('With applySmoothing, works with non-default identities', () => {
        const sdata = new Smoothable({ identity: 1 });
        expect(sdata.next(2)).toBeCloseTo(1.5);
      });
    });

    describe('restart()', () => {
      test('Resets the cascade to the identity value', () => {
        const sdata = new Smoothable();
        expect(sdata.next(2)).toBe(1);
        expect(sdata.next(2)).toBeCloseTo(1.5);
        expect(() => sdata.restart()).not.toThrow();
        expect(sdata.next(2)).toBe(1);
      });
    });
  });

  describe('extensibility', () => {
    test('Works with non-Number data values', () => {
      const sdata = new Smoothable({ identity: new Point2D() });
      sdata.average = (p, q) => new Point2D(
        (p.x + q.x) / 2,
        (p.y + q.y) / 2
      );
      expect(sdata.next(new Point2D(2, 4))).toMatchObject(new Point2D(1, 2));
    });
  });
});

