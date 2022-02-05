/* global expect, describe, test, beforeEach */

'use strict';

const Point2D = require('../src/Point2D.js');
const _ = require('underscore');

describe('Constructor', () => {
  test('does not throw an error given valid input', () => {
    expect(() => new Point2D(0, 0)).not.toThrow();
  });

  test('returns a valid instance', () => {
    expect(new Point2D(0, 0)).toBeInstanceOf(Point2D);
  });

  test('Defaults to the origin (0,0) if no parameters given', () => {
    expect(new Point2D()).toMatchObject({ x: 0, y: 0 });
  });

  test('Uses the given parameters', () => {
    expect(new Point2D(42, -89)).toMatchObject({ x: 42, y: -89 });
  });
});

describe('Prototype methods', () => {
  let origin = null;

  beforeEach(() => {
    origin = new Point2D(0, 0);
  });

  describe('angleTo(point)', () => {
    test('gives the correct angle', () => {
      const pt = new Point2D(3, 3);
      expect(origin.angleTo(pt)).toBeCloseTo(Math.PI / 4);
      expect(origin.angleTo(origin)).toBe(0);
    });
  });

  describe('anglesTo(points)', () => {
    test('gives the correct angles', () => {
      // let's use a unit circle (ish, with easier x/y numbers that don't
      // involve division)
      const trig_circle = [
        // top right
        [new Point2D(1,             0),             0],
        [new Point2D(Math.sqrt(3),  1),             Math.PI / 6],
        [new Point2D(1,             1),             Math.PI / 4],
        [new Point2D(1,             Math.sqrt(3)),  Math.PI / 3],

        // top left
        [new Point2D(0,             1),             Math.PI / 2],
        [new Point2D(-1,            Math.sqrt(3)),  2 * Math.PI / 3],
        [new Point2D(-1,            1),             3 * Math.PI / 4],
        [new Point2D(-Math.sqrt(3), 1),             5 * Math.PI / 6],

        // bottom left: Note that atan2 now gives negative results instead of
        // results > PI. That is, we need to subtract 2 * PI from the positive
        // result.
        [new Point2D(-1,            0),             Math.PI],
        [new Point2D(-Math.sqrt(3), -1),            -5 * Math.PI / 6],
        [new Point2D(-1,            -1),            -3 * Math.PI / 4],
        [new Point2D(-1,            -Math.sqrt(3)), -2 * Math.PI / 3],

        // bottom right
        [new Point2D(0,             -1),            -Math.PI / 2],
        [new Point2D(1,             -Math.sqrt(3)), -Math.PI / 3],
        [new Point2D(1,             -1),            -Math.PI / 4],
        [new Point2D(Math.sqrt(3),  -1),            -Math.PI / 6],
      ];
      const [points, expected_angles] = _.unzip(trig_circle);
      const angles = origin.anglesTo(points);
      _.zip(angles, expected_angles)
        .forEach(([angle, expected]) => {
          expect(angle).toBeCloseTo(expected);
        });
    });
  });

  describe('averageDistanceTo(points)', () => {
    const left = new Point2D(3, 4);
    const right = new Point2D(-3, -4);

    test('gives the correct distance', () => {
      expect(origin.averageDistanceTo([left, right])).toBe(5);
    });

    test('Throws an error if points not provided', () => {
      expect(() => origin.averageDistanceTo()).toThrow();
    });
  });

  describe('clone()', () => {
    test('Returns a clone of the given point', () => {
      const pt = origin.clone();
      expect(pt).toMatchObject(origin);
      expect(pt === origin).toBe(false);

      const off = new Point2D(42, -89);
      const cln = off.clone();
      expect(cln).toMatchObject(off);
      expect(cln === off).toBe(false);
    });
  });

  describe('distanceTo(point)', () => {
    test('gives the correct distance', () => {
      const pt = new Point2D(3, 4);
      expect(origin.distanceTo(pt)).toBe(5);
      expect(origin.distanceTo(origin)).toBe(0);
    });
  });

  describe('minus(point)', () => {
    test('Returns the subtraction of two points', () => {
      const left = new Point2D(42, 45);
      const right = new Point2D(84, 100);
      const result = new Point2D(42, 55);
      expect(right.minus(left)).toMatchObject(result);
    });
  });

  describe('plus(point)', () => {
    test('returns the addition of two points', () => {
      const pt = new Point2D(42, 5);
      const res = origin.plus(pt);
      expect(res).toMatchObject(pt);

      const dbl = res.plus(pt);
      expect(dbl).toMatchObject({ x: 84, y: 10 });
    });
  });

  describe('totalDistanceTo(points)', () => {
    const left = new Point2D(3, 4);
    const right = new Point2D(-3, -4);

    test('gives the correct distance', () => {
      expect(origin.totalDistanceTo([left, right])).toBe(10);
    });

    test('Throws an error if points not provided', () => {
      expect(() => origin.totalDistanceTo()).toThrow();
    });
  });
});

describe('Static methods', () => {
  describe('sum(points)', () => {
    test('Returns the origin if given no arguments', () => {
      expect(Point2D.sum()).toMatchObject({ x: 0, y: 0 });
    });

    test('Returns the origin if given an empty array', () => {
      expect(Point2D.sum([])).toMatchObject({ x: 0, y: 0 });
    });

    test('Returns the point if given an array of one point', () => {
      const p = new Point2D(42, 43);
      expect(Point2D.sum([p])).toEqual(p);
    });

    test('Adds up all the points in an array', () => {
      const p = new Point2D(42, 43);
      const q = new Point2D(8, 7);
      const r = new Point2D(-5, +5);
      const s = new Point2D(1, 2);
      const t = new Point2D(46, 57);
      expect(Point2D.sum([p, q, r, s])).toEqual(t);
    });
  });

  describe('centroid(points)', () => {
    test('Returns null if given no arguments', () => {
      expect(Point2D.centroid()).toBe(null);
    });

    test('Returns null if given an empty array', () => {
      expect(Point2D.centroid([])).toBe(null);
    });

    test('Returns the point if given an array of one point', () => {
      const p = new Point2D(42, 43);
      expect(Point2D.centroid([p])).toEqual(p);
    });

    test('Finds the centroid of an array of points', () => {
      const p = new Point2D(42, 43);
      const q = new Point2D(8, 7);
      const r = new Point2D(-5, +5);
      const s = new Point2D(1, 2);
      const t = new Point2D(46 / 4, 57 / 4);
      expect(Point2D.centroid([p, q, r, s])).toEqual(t);
    });
  });
});

