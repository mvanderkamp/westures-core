/*
 * Test suite for the PointerData class.
 */

/* global expect, describe, test, beforeAll */

'use strict';

const PointerData = require('../src/PointerData.js');
const Point2D     = require('../src/Point2D.js');

describe('PointerData', () => {
  let mouseevent = null;
  let pointerangle = null;
  let pointerdist = null;
  let pointerevent = null;
  let touchevent = null;
  let childElement = null;
  let element = null;
  let id = null;
  let mdata = null;
  let tdata = null;

  beforeAll(() => {
    element = document.createElement('div');
    childElement = document.createElement('div');

    document.body.appendChild(element);
    element.appendChild(childElement);

    mouseevent = {
      type:    'mousemove',
      target:  element,
      clientX:  89,
      clientY:  53,
    };

    touchevent = {
      type:           'touchstart',
      target:         childElement,
      changedTouches: [
        {
          identifier: 17,
          clientX:      -2,
          clientY:      -12,
        },
        {
          identifier: 42,
          clientX:      343,
          clientY:      117,
        },
      ],
    };

    pointerevent = {
      type:      'pointermove',
      target:    childElement,
      pointerId: 3,
      clientX:     0,
      clientY:     0,
    };

    pointerangle = {
      type:      'pointermove',
      target:    childElement,
      pointerId: 3,
      clientX:     3,
      clientY:     3,
    };

    pointerdist = {
      type:      'pointermove',
      target:    childElement,
      pointerId: 3,
      clientX:     3,
      clientY:     4,
    };

    id = 42;
  });

  describe('constructor(event, identifier)', () => {
    test('Requires an event object', () => {
      expect(() => {
        mdata = new PointerData();
      }).toThrow();
    });

    test('Instanties a PointerData when passed valid data', () => {
      expect(() => {
        mdata = new PointerData(mouseevent, id);
      }).not.toThrow();
      expect(mdata).toBeInstanceOf(PointerData);
      expect(() => {
        tdata = new PointerData(touchevent, id);
      }).not.toThrow();
      expect(tdata).toBeInstanceOf(PointerData);
    });

    test('Records the original event', () => {
      expect(mdata.originalEvent).toBe(mouseevent);
      expect(tdata.originalEvent).toBe(touchevent);
    });

    test('Translates the event type into the correct phase', () => {
      expect(mdata.type).toBe('move');
      expect(tdata.type).toBe('start');
    });

    test('Records an epoch timestamp', () => {
      expect(mdata.time).toBeDefined();
      expect(mdata.time / 1000).toBeCloseTo(Date.now() / 1000, 1);
    });

    test('Saves the correct clientX and clientY as a Point2D', () => {
      expect(mdata.point).toBeInstanceOf(Point2D);
      expect(mdata.point.x).toBe(mouseevent.clientX);
      expect(mdata.point.y).toBe(mouseevent.clientY);

      expect(tdata.point).toBeInstanceOf(Point2D);
      expect(tdata.point.x).toBe(touchevent.changedTouches[1].clientX);
      expect(tdata.point.y).toBe(touchevent.changedTouches[1].clientY);
    });
  });

  describe('angleTo(pdata)', () => {
    test('gives the correct angle', () => {
      const pdata = new PointerData(pointerevent, id);
      const pangle = new PointerData(pointerangle, id);
      expect(pdata.angleTo(pangle)).toBeCloseTo(Math.PI / 4);
      expect(pdata.angleTo(pdata)).toBe(0);
    });
  });

  describe('distanceTo(pdata)', () => {
    test('gives the correct distance', () => {
      const pdata = new PointerData(pointerevent, id);
      const pdist = new PointerData(pointerdist, id);
      expect(pdata.distanceTo(pdist)).toBe(5);
      expect(pdata.distanceTo(pdata)).toBe(0);
    });
  });
});

