/**
 * The global API interface for Westures. Exposes a constructor for the
 * {@link Region} and the generic {@link Gesture} class for user gestures to
 * implement, as well as the {@link Point2D} class, which may be useful.
 *
 * @namespace westures-core
 */

'use strict';

const Gesture = require('./src/Gesture.js');
const Point2D = require('./src/Point2D.js');
const Region = require('./src/Region.js');
const Smoothable = require('./src/Smoothable.js');

module.exports = {
  Gesture,
  Point2D,
  Region,
  Smoothable,
};

