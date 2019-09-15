/**
 * The global API interface for westures-core. Exposes all classes, constants,
 * and routines used by the package. Use responsibly.
 *
 * @namespace westures-core
 */

'use strict';

const Gesture = require('./src/Gesture.js');
const Input = require('./src/Input.js');
const Point2D = require('./src/Point2D.js');
const PointerData = require('./src/PointerData.js');
const Region = require('./src/Region.js');
const Smoothable = require('./src/Smoothable.js');
const State = require('./src/State.js');
const constants = require('./src/constants.js');
const utils = require('./src/utils.js');

module.exports = {
  Gesture,
  Input,
  Point2D,
  PointerData,
  Region,
  Smoothable,
  State,
  ...constants,
  ...utils,
};

