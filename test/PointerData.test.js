/*
 * Test suite for the PointerData class.
 */

'use strict';

const PointerData = require('../src/PointerData.js');
const Point2D     = require('../src/Point2D.js');

describe('PointerData', () => {
  let mouseevent, touchevent, pointerevent, pointerangle, pointerdist;
  let mdata, tdata, id, element, childElement;

  beforeAll(() => {
    element = document.createElement('div');
    childElement = document.createElement('div');

    document.body.appendChild(element);
    element.appendChild(childElement);

    mouseevent = {
      type: 'mousemove',
      target: element,
      pageX: 89,
      pageY: 53,
    };

    touchevent = {
      type:           'touchstart',
      target:         childElement,
      changedTouches: [
        {
          identifier: 17,
          pageX: -2,
          pageY: -12,
        },
        {
          identifier: 42,
          pageX: 343,
          pageY: 117,
        },
      ],
    };

    pointerevent = {
      type:      'pointermove',
      target:    childElement,
      pointerId: 3,
      pageX: 0,
      pageY: 0,
    };

    pointerangle = {
      type:      'pointermove',
      target:    childElement,
      pointerId: 3,
      pageX: 3,
      pageY: 3,
    };

    pointerdist = {
      type:      'pointermove',
      target:    childElement,
      pointerId: 3,
      pageX: 3,
      pageY: 4,
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

    test('Saves the correct pageX and pageY as a Point2D', () => {
      expect(mdata.point).toBeInstanceOf(Point2D);
      expect(mdata.point.x).toBe(mouseevent.pageX);
      expect(mdata.point.y).toBe(mouseevent.pageY);

      expect(tdata.point).toBeInstanceOf(Point2D);
      expect(tdata.point.x).toBe(touchevent.changedTouches[1].pageX);
      expect(tdata.point.y).toBe(touchevent.changedTouches[1].pageY);
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

