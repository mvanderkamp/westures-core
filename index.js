/**
 * The global API interface for Westures. Exposes a constructor for the
 * {@link Region} and the generic {@link Gesture} class for user gestures to
 * implement, as well as the {@link Point2D} class, which may be useful.
 *
 * @module westures-core
 */

'use strict';

/** {@link Region} */
const Region  = require('./src/Region.js');

/** {@link Point2D} */
const Point2D = require('./src/Point2D.js');

/** {@link Gesture} */
const Gesture = require('./src/Gesture.js');

module.exports = {
  Gesture,
  Point2D,
  Region,
};

