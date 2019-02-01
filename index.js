/**
 * @file The global API interface for Westures. Exposes a constructor for the
 * {@link Region} and the generic {@link Gesture} class for user gestures to
 * implement, as well as the {@link Point2D} class, which may be useful.
 *
 * @module westures-core
 * @type {Object}
 * @property {Class} Region - The "entry point" class for Westures. Gets the
 *    ball rolling, so to speak, when it is instantiated.
 * @property {Class} Gesture - This class is the one all Gestures using this
 *    library should extend.
 * @property {Class} Point2D - This class is available for convenience. It
 *    defines some basic operations on a point in a two dimensional space.
 */

'use strict';

const Region  = require('./src/Region.js');
const Point2D = require('./src/Point2D.js');
const Gesture = require('./src/Gesture.js');

module.exports = {
  Gesture,
  Point2D,
  Region,
};

