/*
 * Contains the {@link PointerData} class
 */

'use strict';

const Point2D = require('./Point2D.js');
const PHASE   = require('./PHASE.js');

/**
 * @private
 * @inner
 * @memberof PointerData
 *
 * @return {Event} The Event object which corresponds to the given identifier.
 *    Contains pageX, pageY values (or whichever X/Y source was selected).
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
 * @param {Event} event - The event object being wrapped.
 * @param {number} identifier - The index of touch if applicable
 * @param {string} [source='page'] - One of 'page', 'client', or 'screen'.
 * Determines what the source of (x,y) coordinates will be from the input
 * events. ('X' and 'Y' will be appended, then those are the properties that
 * will be looked up).
 */
class PointerData {
  constructor(event, identifier, source='page') {
    /**
     * The original event object.
     *
     * @type {Event}
     */
    this.originalEvent = event;

    /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end'.
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

    const eventObj = getEventObject(event, identifier);
    /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     *
     * @type {westures-core.Point2D}
     */
    this.point = new Point2D(eventObj[source + 'X'], eventObj[source + 'Y']);
    // this.point = new Point2D(eventObj.clientX, eventObj.clientY);
  }

  /**
   * Calculates the angle between this event and the given event.
   *
   * @param {PointerData} pdata
   *
   * @return {number} Radians measurement between this event and the given
   *    event's points.
   */
  angleTo(pdata) {
    return this.point.angleTo(pdata.point);
  }

  /**
   * Calculates the distance between two PointerDatas.
   *
   * @param {PointerData} pdata
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */
  distanceTo(pdata) {
    return this.point.distanceTo(pdata.point);
  }
}

module.exports = PointerData;

