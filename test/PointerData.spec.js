'use strict';

/**
 * @file PointerData.js
 *
 * Test suite for the PointerData class.
 */

const PointerData = require('../src/PointerData.js');
const Point2D     = require('../src/Point2D.js');

describe('PointerData', () => {
  let pdata, mdata, mouseevent, touchevent, id, element, childElement;
  
  beforeAll(() => {
    element = document.createElement("DIV");
    document.body.appendChild(element);

    childElement = document.createElement("P");
    element.appendChild(childElement);

    mouseevent = {
      type: 'mousemove',
      target: element,
      parentNode: document,
      clientX: 89,
      clientY: -3,
    };

    touchevent = {
      type: 'touchstart',
      target: childElement,
      parentNode: document,
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
      expect(() => pdata = new PointerData()).toThrow();
    });
  
    test('Instanties a PointerData when passed valid data', () => {
      expect(() => pdata = new PointerData(mouseevent, id)).not.toThrow();
      expect(pdata).toBeInstanceOf(PointerData);
      expect(() => pdata = new PointerData(touchevent, id)).not.toThrow();
      expect(pdata).toBeInstanceOf(PointerData);
    });
  
    test('Correctly populates the initial elements container', () => {
      pdata = new PointerData(mouseevent, id);
      expect(pdata.initialElements.has(window)).toBe(true);
      expect(pdata.initialElements.has(document)).toBe(true);
      expect(pdata.initialElements.has(element)).toBe(true);
      expect(pdata.initialElements.has(childElement)).toBe(false);

      pdata = new PointerData(touchevent, id);
      expect(pdata.initialElements.has(window)).toBe(true);
      expect(pdata.initialElements.has(document)).toBe(true);
      expect(pdata.initialElements.has(element)).toBe(true);
      expect(pdata.initialElements.has(childElement)).toBe(true);
    });

    test('Records the original event', () => {
      pdata = new PointerData(mouseevent, id);
      expect(pdata.originalEvent).toBe(mouseevent);
      pdata = new PointerData(touchevent, id);
      expect(pdata.originalEvent).toBe(touchevent);
    });

    test('Translates the event type into the correct phase', () => {
      pdata = new PointerData(mouseevent, id);
      expect(pdata.type).toBe('move');
      pdata = new PointerData(touchevent, id);
      expect(pdata.type).toBe('start');
    });

    test('Records an epoch timestamp', () => {
      pdata = new PointerData(mouseevent, id);
      expect(pdata.time).toBeDefined();
      expect(pdata.time / 1000).toBeCloseTo(Date.now() / 1000, 1);
    });

    test('Saves the correct clientX and clientY as a Point2D', () => {
      pdata = new PointerData(mouseevent, id);
      expect(pdata.point).toBeInstanceOf(Point2D);
      expect(pdata.point.x).toBe(mouseevent.clientX);
      expect(pdata.point.y).toBe(mouseevent.clientY);

      pdata = new PointerData(touchevent, id);
      expect(pdata.point).toBeInstanceOf(Point2D);
      expect(pdata.point.x).toBe(touchevent.changedTouches[1].clientX);
      expect(pdata.point.y).toBe(touchevent.changedTouches[1].clientY);
    });
  });

  describe('angleTo(pdata)', () => {
  });

  describe('distanceTo(pdata)', () => {
  });

  describe('isInside(element)', () => {
  });

  describe('midpointTo(pdata)', () => {
  });

  describe('wasInside(element)', () => {
  });
});

