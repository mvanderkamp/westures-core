/**
 * Test suite for the PointerData class.
 */

'use strict';

const PointerData = require('../src/PointerData.js');
const Point2D     = require('../src/Point2D.js');

describe('PointerData', () => {
  let mdata, tdata, mouseevent, touchevent, id, element, childElement;
  
  beforeAll(() => {
    element = {
      parentNode: document,
      getBoundingClientRect: jest.fn(),
    };

    childElement = {
      parentNode: element,
      getBoundingClientRect: jest.fn(),
    };

    mouseevent = {
      type: 'mousemove',
      target: element,
      clientX: 89,
      clientY: 53,
    };

    touchevent = {
      type: 'touchstart',
      target: childElement,
      changedTouches: [ 
        {
          identifier: 17,
          clientX: -2,
          clientY: -12,
        },
        {
          identifier: 42,
          clientX: 343,
          clientY: 117,
        },
      ],
    };

    id = 42;
  });
  
  describe('constructor(event, identifier)', () => {
    test('Requires an event object', () => {
      expect(() => mdata = new PointerData()).toThrow();
    });
  
    test('Instanties a PointerData when passed valid data', () => {
      expect(() => mdata = new PointerData(mouseevent, id)).not.toThrow();
      expect(mdata).toBeInstanceOf(PointerData);
      expect(() => tdata = new PointerData(touchevent, id)).not.toThrow();
      expect(tdata).toBeInstanceOf(PointerData);
    });
  
    test('Correctly populates the initial elements container', () => {
      expect(mdata.initialElements.has(window)).toBe(true);
      expect(mdata.initialElements.has(document)).toBe(true);
      expect(mdata.initialElements.has(element)).toBe(true);
      expect(mdata.initialElements.has(childElement)).toBe(false);

      expect(tdata.initialElements.has(window)).toBe(true);
      expect(tdata.initialElements.has(document)).toBe(true);
      expect(tdata.initialElements.has(element)).toBe(true);
      expect(tdata.initialElements.has(childElement)).toBe(true);
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
  });

  describe('distanceTo(pdata)', () => {
  });

  describe('midpointTo(pdata)', () => {
  });

  describe('wasInside(element)', () => {
  });
});

