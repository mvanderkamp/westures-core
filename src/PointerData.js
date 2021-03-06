'use strict';

const Point2D   = require('./Point2D.js');
const { PHASE } = require('./constants.js');

/**
 * @private
 * @inner
 * @memberof westures-core.PointerData
 *
 * @return {Event} The Event object which corresponds to the given identifier.
 *    Contains clientX, clientY values.
 */
function getEventObject(event, identifier) {
  if (event.changedTouches) {
    return Array.from(event.changedTouches).find(touch => {
      return touch.identifier === identifier;
    });
  }
  return event;
}

/**
 * Low-level storage of pointer data based on incoming data from an interaction
 * event.
 *
 * @memberof westures-core
 *
 * @param {Event} event - The event object being wrapped.
 * @param {number} identifier - The index of touch if applicable
 */
class PointerData {
  constructor(event, identifier) {
    const { clientX, clientY } = getEventObject(event, identifier);

    /**
     * The original event object.
     *
     * @type {Event}
     */
    this.event = event;

    /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end' or 'cancel'
     *
     * @type {string}
     */
    this.type = PHASE[event.type];

    /**
     * The timestamp of the event in milliseconds elapsed since January 1, 1970,
     * 00:00:00 UTC.
     *
     * @type {number}
     */
    this.time = Date.now();

    /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     *
     * @type {westures-core.Point2D}
     */
    this.point = new Point2D(clientX, clientY);
  }
}

module.exports = PointerData;

